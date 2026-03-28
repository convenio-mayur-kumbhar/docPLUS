using DocPlus.Entities.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using System.Collections;
using System.Drawing;
using System.Drawing.Imaging;

namespace DocPlus.Controllers
{
    public class LoginController : BaseController
    {
        public LoginController(IMemoryCache cache, IConfiguration configuration, IWebHostEnvironment hostingEnvironment) : base(cache, configuration, hostingEnvironment)
        { }

        [HttpGet]
        public IActionResult Index()
        {
            HttpContext.Session.Clear();
            return View();
        }

        public IActionResult Error()
        {
            HttpContext.Session.Clear();
            return View();
        }

        public IActionResult AccessDenied()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Index(Login_VM model)
        {
            string sessionCaptcha = HttpContext.Session.GetString("CaptchaCode");

            if (model.CaptchaCode != sessionCaptcha)
            {
                ModelState.AddModelError("CaptchaError", "Invalid Captcha");
                return View(model);
            }

            string ScreenID = null;
            string ScreenName = null;

            if (!ModelState.IsValid)
                return View();

            HttpResponseMessage response = await CallPostAPIAsync("LoginAPI", model);

            if (!response.IsSuccessStatusCode)
            {
                ModelState.AddModelError("IncorrectCredentials", "Invalid username and/or password.");
                return View();
            }

            // ✅ Correct Deserialization
            var apiResponse = await response.Content.ReadFromJsonAsync<ApiResponse<LoginResponseData>>();

            var Data = apiResponse?.Data?.User;

            if (Data == null || Data.ObjUser == null || Data.ObjUser.Count == 0)
            {
                ModelState.AddModelError("IncorrectCredentials", "Invalid username and/or password.");
                return View();
            }
           

            UserEmployee_VM row = Data.ObjUser[0];
            List<MenuScreen_VM> MenuRow = Data.ObjMenu;
            List<ScreenAction_VM> ActionRow = Data.ObjAction;

            if (MenuRow != null && MenuRow.Count > 0)
                MenuRow = GetUserRoleMenu(MenuRow);

            if (ActionRow != null && ActionRow.Count > 0)
                ActionRow = GetUserRoleScreenAction(ActionRow);

            if (row.EndUserID > 0 && ((MenuRow != null && MenuRow.Count > 0) || row.IsCustomerUser))
            {
                Hashtable User_LoginInfo = new Hashtable
                {
                    ["UserID"] = row.EndUserID,
                    ["UserRoleID"] = row.UserRoleID,
                    ["AccessPoint"] = model.IPAddress,
                    ["UserName"] = row.UserName,
                    ["UTCOffset"] = row.UTCOffset,
                  //  ["CustomerID"] = row.CustomerID,
                    ["CustomerName"] = row.CustomerName,
                    ["IsCustomerUser"] = row.IsCustomerUser
                };

                string User_LoginJson = JsonConvert.SerializeObject(User_LoginInfo);

                HttpContext.Session.SetString("UserData", User_LoginJson);
                // ✅ STORE TOKENS (MOST IMPORTANT)
                HttpContext.Session.SetString("AccessToken", apiResponse.Data.Token ?? "");
                HttpContext.Session.SetString("RefreshToken", apiResponse.Data.RefreshToken ?? "");
                // ✅ Store Token properly from API
                Cache.Set("Token", apiResponse.Data.Token);

                // Caching Menu & Actions
                Cache.Set("objMenu" + row.UserRoleID, MenuRow);
                Cache.Set("objAction" + row.UserRoleID, ActionRow);

                if (MenuRow.Count > 0)
                {
                    var firstMenu = MenuRow.FirstOrDefault(x => x.ScreenID != null);

                    if (firstMenu != null)
                    {
                        ScreenID = firstMenu.EncryptScreenID;
                        ScreenName = firstMenu.ObjectName?.Replace(" ", "");
                    }
                }
                else
                {
                    ModelState.AddModelError("IncorrectCredentials", "You do not have access to the system! Please contact administrator.");
                    return View();
                }
            }
            else
            {
                ModelState.AddModelError("IncorrectCredentials", "You do not have access to the system! Please contact administrator.");
                return View();
            }

            return RedirectToAction("Index", ScreenName, new { id = ScreenID });
        }

        public async Task<JsonResult> UserCustomer(CustomerUserEmployee_VM Model)
        {
            string ScreenID = null;
            string ScreenName = null;
            if (ModelState.IsValid)
            {
                GetUserInfo(Model);
                HttpResponseMessage response = await CallPostAPIAsync("LoginAPI/UserCustomer", Model);
                if (response.IsSuccessStatusCode)
                {
                    EndUserLogin_VM Data = await response.Content.ReadFromJsonAsync<EndUserLogin_VM>();
                    List<MenuScreen_VM> MenuRow = Data.ObjMenu;
                    List<ScreenAction_VM> ActionRow = Data.ObjAction;

                    if (MenuRow != null && MenuRow.Count > 0)
                        MenuRow = GetUserRoleMenu(Data.ObjMenu);

                    if (ActionRow != null && ActionRow.Count > 0)
                        ActionRow = GetUserRoleScreenAction(Data.ObjAction);

                    if (Model.CurrentEndUserID > 0 && MenuRow.Count > 0)
                    {
                        HttpContext.Session.Clear();
                        HttpContext.Session.Remove("UserData");

                        Hashtable User_LoginInfo = new Hashtable
                        {
                            ["UserID"] = Model.CurrentEndUserID,
                            ["UserRoleID"] = Model.CurrentUserRoleID,
                            ["AccessPoint"] = "",
                            ["UserName"] = Model.UserName,
                            ["UTCOffset"] = Model.CurrentUTCOffset,
                           // ["CustomerID"] = Model.CustomerID,
                            ["CustomerName"] = Model.CustomerName,
                            ["IsCustomerUser"] = Model.IsCustomerUser

                        };

                        string User_LoginJson = JsonConvert.SerializeObject(User_LoginInfo); // Serializing hashtable for storing into session

                        HttpContext.Session.SetString("UserData", "");
                        HttpContext.Session.SetString("UserData", User_LoginJson);

                        if (MenuRow.Count > 0)
                        {
                            ScreenID = MenuRow.Where(x => x.ScreenID != null).Select(x => x.EncryptScreenID).First();
                            ScreenName = MenuRow.Where(x => x.ScreenID != null).Select(x => x.ObjectName).First();
                            ScreenName = ScreenName.Replace(" ", "");
                        }
                    }

                    ScreenAction_VM objscreen = new ScreenAction_VM();
                    objscreen.ActionCode = ScreenID;
                    objscreen.ActionName = ScreenName;
                    return GetDataResponse(objscreen);

                    //return RedirectToAction("Index", ScreenName, new { id = ScreenID });

                }
                else
                {
                    return GetDataResponseException(default);
                }
            }
            else
                return GetDataResponseException(default);
        }

        public IActionResult GenerateCaptcha()
        {
            var random = new Random();
            string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            string captcha = new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());

            HttpContext.Session.SetString("CaptchaCode", captcha);
            Bitmap bmp = new Bitmap(150, 40);
            Graphics g = Graphics.FromImage(bmp);

            g.Clear(Color.White);
            Font font = new Font("Arial", 20, FontStyle.Bold);

            g.DrawString(captcha, font, Brushes.Black, 10, 5);

            MemoryStream ms = new MemoryStream();
            bmp.Save(ms, System.Drawing.Imaging.ImageFormat.Png);

            return File(ms.ToArray(), "image/png");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var refreshToken = HttpContext.Session.GetString("RefreshToken");

                if (!string.IsNullOrEmpty(refreshToken))
                {
                    var request = new RefreshTokenRequest
                    {
                        RefreshToken = refreshToken
                    };

                    await CallPostAPIAsync("LoginAPI/logout", request);
                }
            }
            catch (Exception ex)
            {
                // optional logging
            }

            // ✅ CLEAR SESSION
            HttpContext.Session.Clear();

            return RedirectToAction("Index", "Login");
        }
    }
}
