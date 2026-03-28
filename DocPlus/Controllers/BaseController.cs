using DocPlus.Entities.Utility;
using DocPlus.Entities.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using System.Collections;
using System.Globalization;
using System.Net.Http.Headers;

namespace DocPlus.Controllers
{
    public class BaseController : Controller
    {
        public IConfiguration Configuration { get; }
        public IMemoryCache Cache { get; }
        public IWebHostEnvironment HostingEnvironment { get; }

        public BaseController()
        { }

        public BaseController(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public BaseController(IMemoryCache cache, IConfiguration configuration)
        {
            Configuration = configuration;
            Cache = cache;
        }

        public BaseController(IMemoryCache cache, IConfiguration configuration, IWebHostEnvironment hostingEnvironment)
        {
            Configuration = configuration;
            Cache = cache;
            HostingEnvironment = hostingEnvironment;
        }

        public BaseController(IConfiguration configuration, IWebHostEnvironment hostingEnvironment)
        {
            Configuration = configuration;
            HostingEnvironment = hostingEnvironment;
        }

        public static readonly log4net.ILog logger = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        // GET: Base
        public string SaveMessage { get { return "Saved Successfully!"; } }
        public string SaveErrorMessage { get { return "Error occured while saving data!"; } }
        public string UpdateMessage { get { return "Updated successfully!"; } }
        public string UpdateErrorMessage { get { return "Error occured while updating data!"; } }
        public string DeleteMessage { get { return "Deleted successfully!"; } }
        public string UseInAnotherEntityMessage { get { return "Unable to delete record since it has been used!"; } }
        public string DeleteErrorMessage { get { return "Error occured while deleting data!"; } }
        public string NullErrorMessage { get { return "Data cannot be null!"; } }


        public IActionResult RedirectToLogin()
        {
            return RedirectToAction("Index", "Login");
        }

        public int UserID
        {
            get
            {
                if (HttpContext.Session.GetString("UserData") == null)
                {
                    RedirectToLogin();
                }
                else
                {
                    Hashtable User_LoginInfo = JsonConvert.DeserializeObject<Hashtable>(HttpContext.Session.GetString("UserData"));
                    return Convert.ToInt32(User_LoginInfo["UserID"].ToString());
                }

                return 0;
            }
        }
        public short UserRoleID
        {
            get
            {
                if (HttpContext.Session.GetString("UserData") == null)
                {
                    RedirectToLogin();
                }
                else
                {
                    Hashtable User_LoginInfo = JsonConvert.DeserializeObject<Hashtable>(HttpContext.Session.GetString("UserData"));
                    return Convert.ToInt16(User_LoginInfo["UserRoleID"].ToString());
                }

                return 0;
            }
        }
        public short CurrentScreenID
        {
            get
            {
                if (HttpContext.Session.GetString("UserData") == null)
                {
                    RedirectToLogin();
                }
                else
                {
                    Hashtable User_LoginInfo = JsonConvert.DeserializeObject<Hashtable>(HttpContext.Session.GetString("UserData"));
                    return Convert.ToInt16(User_LoginInfo["CurrentScreenID"].ToString());
                }

                return 0;
            }
        }
        public string AccessPoint
        {
            get
            {
                if (HttpContext.Session.GetString("UserData") == null)
                {
                    RedirectToLogin();
                }
                else
                {
                    Hashtable User_LoginInfo = JsonConvert.DeserializeObject<Hashtable>(HttpContext.Session.GetString("UserData"));
                    return (string)User_LoginInfo["AccessPoint"];
                }

                return "";
            }
        }
        public decimal UTCOffset
        {
            get
            {
                if (HttpContext.Session.GetString("UserData") == null)
                {
                    RedirectToLogin();
                }
                else
                {
                    Hashtable User_LoginInfo = JsonConvert.DeserializeObject<Hashtable>(HttpContext.Session.GetString("UserData"));
                    return Convert.ToDecimal(User_LoginInfo["UTCOffset"].ToString());
                }

                return 0;
            }
        }
        public void GetUserInfo(dynamic Model)
        {
            Model.CurrentEndUserID = UserID;
            Model.CurrentUserRoleID = UserRoleID;
            Model.AccessPoint = AccessPoint;
            Model.CurrentUTCOffset = UTCOffset;
        }
        public IActionResult CheckSession(ActionResult viewResult)
        {
            if (HttpContext.Session.GetString("UserData") == null)
            {
                RedirectToLogin();
            }
            return viewResult;
        }
        public void CheckSession()
        {
            if (HttpContext.Session.GetString("UserData") == null)
            {
                RedirectToLogin();
            }
        }
        /// <summary>      
        /// </summary>
        /// <param name="ScreenID"></param>
        /// <param name="ScreenName"></param>
        /// <param name="accesstype">has default check view access else one have to pass</param>
        /// <returns></returns>
        public bool CheckAccess(int ScreenID, string ScreenName, EnumScreenAccess accesstype = EnumScreenAccess.HasSelect)
        {
            List<MenuScreen_VM> objMenuList = null;
            if (Cache.Get("objMenu" + UserRoleID) != null)
            {
                objMenuList = Cache.Get<List<MenuScreen_VM>>("objMenu" + UserRoleID);

                switch (accesstype)
                {
                    case EnumScreenAccess.HasInsert:
                        {
                            if (objMenuList.Where(x => x.ScreenID == ScreenID && x.HasInsert == true && x.ObjectName == ScreenName).ToList().Count > 0)
                            {
                                return true;
                            }
                            break;
                        }
                    case EnumScreenAccess.HasUpdate:
                        {
                            if (objMenuList.Where(x => x.ScreenID == ScreenID && x.HasUpdate == true && x.ObjectName == ScreenName).ToList().Count > 0)
                            {
                                return true;
                            }
                            break;
                        }
                    case EnumScreenAccess.HasDelete:
                        {
                            if (objMenuList.Where(x => x.ScreenID == ScreenID && x.HasDelete == true && x.ObjectName == ScreenName).ToList().Count > 0)
                            {
                                return true;
                            }
                            break;
                        }
                    case EnumScreenAccess.HasSelect:
                        {
                            if (objMenuList.Where(x => x.ScreenID == ScreenID && x.HasSelect == true && x.ObjectName == ScreenName).ToList().Count > 0)
                            {
                                return true;
                            }
                            break;
                        }
                    case EnumScreenAccess.HasImport:
                        {
                            if (objMenuList.Where(x => x.ScreenID == ScreenID && x.HasImport == true && x.ObjectName == ScreenName).ToList().Count > 0)
                            {
                                return true;
                            }
                            break;
                        }
                    case EnumScreenAccess.HasExport:
                        {
                            if (objMenuList.Where(x => x.ScreenID == ScreenID && x.HasExport == true && x.ObjectName == ScreenName).ToList().Count > 0)
                            {
                                return true;
                            }
                            break;
                        }
                }
            }
            return false;
        }

        public bool CheckAccessDelete(int ScreenID, string ScreenName)
        {
            return CheckAccess(ScreenID, ScreenName, EnumScreenAccess.HasDelete);
        }

        public IActionResult RedirectOnAccess()
        {
            return HttpContext.Session.GetString("UserData") == null
                ? RedirectToAction("Index", "Login")
                : RedirectToAction("AccessDenied", "Login");
        }

        public IActionResult RedirectOnAccess(string Message)
        {
            ViewBag.Message = Message;
            return RedirectToAction("AccessDenied", "Login", new { area = string.Empty });
        }

        public List<MenuScreen_VM> GetUserRoleMenu(List<MenuScreen_VM> ModelList)
        {
            List<MenuScreen_VM> menuList = new List<MenuScreen_VM>();

            menuList = (from MenuScreen_VM Model in ModelList
                        select new MenuScreen_VM()
                        {
                            ObjectName = Model.ObjectName,
                            IsObjectMenu = Model.IsObjectMenu,
                            Sequence = Model.Sequence,
                            MenuCode = Model.MenuCode,
                            ScreenID = Model.ScreenID,
                            HasInsert = Model.HasInsert,
                            HasUpdate = Model.HasUpdate,
                            HasDelete = Model.HasDelete,
                            HasSelect = Model.HasSelect,
                            HasImport = Model.HasImport,
                            HasExport = Model.HasExport,
                            EncryptScreenID = Security.Encrypt(Model.ScreenID.ToString())
                        }).OrderBy(x => x.Sequence).ToList();

            return menuList;
        }

        public List<ScreenAction_VM> GetUserRoleScreenAction(List<ScreenAction_VM> ModelList)
        {
            var ScreenActionList = new List<ScreenAction_VM>();

            ScreenActionList = (from ScreenAction_VM Model in ModelList
                                select new ScreenAction_VM()
                                {
                                    ScreenID = Model.ScreenID,
                                    ActionCode = Model.ActionCode,
                                    ActionName = Model.ActionName,
                                    Sequence = Model.Sequence,
                                    IsAudited = Model.IsAudited,
                                    IsRendered = Model.IsRendered,
                                }).OrderBy(x => x.Sequence).ToList();

            return ScreenActionList;
        }

        public static string Encrypt(string data)
        {
            return Security.Encrypt(data);
        }

        public static string Decrypt(string data)
        {
            return Security.Decrypt(data);
        }

        public override void OnActionExecuting(ActionExecutingContext context)
        {
            Thread.CurrentThread.CurrentUICulture = new CultureInfo("en-US");
            Thread.CurrentThread.CurrentCulture = Thread.CurrentThread.CurrentUICulture;
            base.OnActionExecuting(context);
        }

        public JsonResult GetAddEditDeleteResponse(dynamic Data, string ActionType)
        {
            if (Data != null && (ActionType == "Add" || ActionType == "AddOrUpdate"))
            {
                return Json(new JsonResponse("Success", SaveMessage, Data));
            }

            if (Data != null && ActionType == "Update")
            {
                return Json(new JsonResponse("Success", UpdateMessage, Data));
            }

            if (Data != null && ActionType == "Delete")
            {
                return Json(new JsonResponse("Success", DeleteMessage, Data));
            }

            if (Data != null && ActionType == "Delete")
            {
                return Json(new JsonResponse("ReferenceError", UseInAnotherEntityMessage, Data));
            }
            else
            {
                return Json(new JsonResponse("Error", SaveErrorMessage, Data));
            }
        }
        public JsonResult GetModelStateIsValidException(ViewDataDictionary viewData)
        {
            string ErrorMessage = string.Empty;
            foreach (ModelStateEntry modelState in viewData.Values)
            {
                foreach (ModelError error in modelState.Errors)
                {
                    ErrorMessage += error.ErrorMessage + "<br/>";
                }
            }

            return Json(new JsonResponse("Error", ErrorMessage, null));
        }
        public JsonResult GetModelStateIsValidException(ModelStateDictionary ModelState)
        {
            IEnumerable<ModelError> ErrorMessage = ModelState.Values.SelectMany(v => v.Errors);
            return Json(new JsonResponse("Error", null, ErrorMessage));
        }
        public JsonResult GetAddEditErrorException(Exception ex)
        {
            if (ex.InnerException != null)
            {
                return Json(new JsonResponse("Error", ex.InnerException.Message.ToString(), null));
            }
            else
            {
                return Json(new JsonResponse("Error", ex.Message.ToString(), null));
            }
        }
        public dynamic GetDataResponse(dynamic vm)
        {
            return Json(new JsonResponse("Success", "Success", vm));
        }
        public dynamic GetDataResponseException(Exception ex)
        {
            return Json(new JsonResponse("Error", "Error occured while processing request: " + ex.Message.ToString(), null));
        }
        public dynamic GetDataResponseIntoJson(dynamic vm)
        {   /*https://www.newtonsoft.com/json/help/html/SerializeDataSet.htm*/
            return Json(new JsonResponse("Success", "Success", JsonConvert.SerializeObject(vm, Formatting.None)));
        }

        public ActionResult RedirectLoggedInUser(string ModuleCodes, string ScreenID)
        {
            switch (ModuleCodes)
            {
                case ModuleCode.Safety:
                    {
                        return (ScreenID == "") ? RedirectToAction("blankindex", "Safety/SafetyDashboard", new { }) : RedirectToAction("Index", "Safety/SafetyDashboard", new { id = ScreenID });
                    }
                    ;
                case ModuleCode.Incident:
                    {
                        return (ScreenID == "") ? RedirectToAction("blankindex", "Incident/IncidentDashboard", new { }) : RedirectToAction("Dashboard", "Incident/IncidentDashboard", new { id = ScreenID });
                    }
                    ;
                case ModuleCode.Training:
                    {
                        return (ScreenID == "") ? RedirectToAction("blankindex", "Training/TrainingDashboard", new { }) : RedirectToAction("Dashboard", "Training/TrainingDashboard", new { id = ScreenID });
                    }
                    ;
                case ModuleCode.Drill:
                    {
                        return (ScreenID == "") ? RedirectToAction("blankindex", "Drill/DrillDashboard", new { }) : RedirectToAction("Dashboard", "Drill/DrillDashboard", new { id = ScreenID });
                    }
                    ;
                case ModuleCode.FRAS:
                    {
                        return (ScreenID == "") ? RedirectToAction("blankindex", "FRAS/FRASDashboard", new { }) : RedirectToAction("Dashboard", "FRAS/FRASDashboard", new { id = ScreenID });
                    }
                    ;
                case ModuleCode.Work:
                    {
                        return (ScreenID == "") ? RedirectToAction("blankindex", "Work/WorkDashboard", new { }) : RedirectToAction("Dashboard", "Work/WorkDashboard", new { id = ScreenID });
                    }
                    ;
                case ModuleCode.HIRA:
                    {
                        return (ScreenID == "") ? RedirectToAction("blankindex", "HIRA/HIRADashboard", new { }) : RedirectToAction("Dashboard", "HIRA/HIRADashboard", new { id = ScreenID });
                    }
                    ;
                case "CD":
                    {
                        return RedirectToAction("Dashboard", "CustomerPortal/CustomerDashboard", new { id = ScreenID/*can be called as Customer ID*/ });
                    }
                    ;
                default:
                    { return (ScreenID == "") ? RedirectToAction("blankindex", "home", new { }) : RedirectToAction("Index", "Home", new { id = ScreenID }); }
                    ;// Base Module
            }
        }
        protected bool ThumbnailCallback()
        {
            return false;
        }
        protected bool CheckUserHasValue(dynamic Model)
        {
            return Model.CurrentEndUserID == 0 ? true : false;
        }

        /// <summary>
        /// use when login user don't have dashboard access
        /// </summary>
        /// <returns></returns>
        public IActionResult BlankIndex()
        {
            return View();
        }

        #region API Helpers
        /// <summary>
        /// This property will give URI according to enviroment
        /// </summary>
        /// <returns></returns>
        public Uri BaseAddress
        {
            get
            {
                if (HostingEnvironment.IsDevelopment())
                {
                    return new Uri(Configuration["BaseURI:Development"]);
                }
                else if (HostingEnvironment.IsProduction())
                {
                    return new Uri(Configuration["BaseURI:Production"]);
                }
                else
                {
                    throw new Exception("Enviroment Not Set");
                }
            }
        }

        /// <summary>
        /// This Method Will Call Post API
        /// </summary>
        /// <param name="APIEndPoint"></param>
        /// <param name="Model"></param>
        /// <returns></returns>
        public async Task<HttpResponseMessage> CallPostAPIAsync(string APIEndPoint, object Model)
        {
            if (EndPointCheck(APIEndPoint))
            {
                HttpClient client = new HttpClient();
                client.BaseAddress = BaseAddress;

                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(
                    new MediaTypeWithQualityHeaderValue("application/json"));

                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Convert.ToString(Cache.Get("Token")));

                var response = await client.PostAsJsonAsync(APIEndPoint, Model);

                return response;
            }

            return null;
        }

        /// <summary>
        /// This method will call post API
        /// </summary>
        /// <param name="APIEndPoint"></param>
        /// <param name="Model"></param>
        /// <returns></returns>
        public async Task<HttpResponseMessage> CallPutAPIAsync(string APIEndPoint, object Model)
        {
            if (EndPointCheck(APIEndPoint))
            {
                using (HttpClient client = new HttpClient() { BaseAddress = BaseAddress })
                {
                    client.DefaultRequestHeaders.Accept.Clear();
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Convert.ToString(Cache.Get("Token")));

                    HttpResponseMessage response = await client.PutAsJsonAsync(APIEndPoint, Model);
                    // response.EnsureSuccessStatusCode();
                    return response;
                }
            }
            else return null;
        }

        /// <summary>
        /// This method will call get API
        /// </summary>
        /// <param name="APIEndPoint"></param>
        /// <param name="Model"></param>
        /// <returns></returns>
        public async Task<HttpResponseMessage> CallGetAPIAsync(string APIEndPoint)
        {

            if (EndPointCheck(APIEndPoint))
            {
                using (HttpClient client = new HttpClient() { BaseAddress = BaseAddress })
                {
                    client.DefaultRequestHeaders.Accept.Clear();
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Convert.ToString(Cache.Get("Token")));

                    HttpResponseMessage response = await client.GetAsync(APIEndPoint);
                    //response.EnsureSuccessStatusCode();
                    return response;
                }
            }
            else return null;
        }

        /// <summary>
        /// This method will call Delete API
        /// </summary>
        /// <param name="APIEndPoint"></param>
        /// <param name="Model"></param>
        /// <returns></returns>
        public async Task<HttpResponseMessage> CallDeleteAPIAsync(string APIEndPoint)
        {

            if (EndPointCheck(APIEndPoint))
            {
                using (HttpClient client = new HttpClient() { BaseAddress = BaseAddress })
                {
                    client.DefaultRequestHeaders.Accept.Clear();
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Convert.ToString(Cache.Get("Token")));

                    HttpResponseMessage response = await client.DeleteAsync(APIEndPoint);
                    // client.PutAsJsonAsync(APIEndPoint, Model);
                    //response.EnsureSuccessStatusCode();
                    return response;
                }
            }
            else return null;
        }

        public bool EndPointCheck(string APIEndPoint)
        {
            if (APIEndPoint == null)
                throw new ArgumentNullException("API end point is null");
            else
                return true;
        }

        #endregion
    }
};