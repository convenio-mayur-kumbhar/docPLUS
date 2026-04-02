using DocPlus.Entities.ClinicalModels;
using DocPlus.Entities.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;

namespace DocPlus.Controllers
{
    public class ClinicalController : BaseController
    {

        public ClinicalController(IMemoryCache cache, IConfiguration configuration, IWebHostEnvironment hostingEnvironment) : base(cache, configuration, hostingEnvironment)
        { }
        public ActionResult Index()
        {
            return View();
        }

        public PartialViewResult _partialStartAssessment()
        {
            return PartialView("_partialStartAssessment");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> GetData(Patient_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);
                    HttpResponseMessage response = await CallPostAPIAsync("ClinicalAPI/ClinicalPatientsList", Model);

                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        var data = JsonConvert.DeserializeObject<List<Patient_VM>>(result.Data.ToString());

                        return GetDataResponse(data!);
                    }
                    else
                    {
                        return GetDataResponseException(default!);
                    }
                }
                else
                {
                    return GetModelStateIsValidException(ModelState);
                }
            }
            catch (Exception ex)
            {
                return GetDataResponseException(ex);
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> GetAssetmentDataByID(Patient_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);
                    HttpResponseMessage response = await CallGetAPIAsync($"ClinicalAPI/GetClinicalDetailsByPatientId/{Model.PatientID}");

                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        var data = JsonConvert.DeserializeObject<ClinicalDetails_CM>(result.Data.ToString());

                        return GetDataResponse(data!);
                    }
                    else
                    {
                        return GetDataResponseException(default!);
                    }
                }
                else
                {
                    return GetModelStateIsValidException(ModelState);
                }
            }
            catch (Exception ex)
            {
                return GetDataResponseException(ex);
            }
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> SaveInitialDetails(PatientInitialDetails_CM Model)
        {
            if (!ModelState.IsValid)
                return GetModelStateIsValidException(ModelState);
            try
            {
                GetUserInfo(Model);
                if (Model.PAT_ID > 0)
                {
                    HttpResponseMessage response = await CallPostAPIAsync("ClinicalAPI/SaveInitialDetails", Model);

                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        return Json(new
                        {
                            Status = result.Status == "1",
                            Message = result.Message
                        });
                    }
                    else
                    {
                        return Json(new { Status = false, Message = "API Error" });
                    }
                }

                return Json(new { Status = false, Message = "Invalid Patient ID" });
            }
            catch (Exception ex)
            {
                logger.Error("SaveInitialDetails Error: ", ex);
                return Json(new { Status = false, Message = "Exception occurred" });
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> SaveAssessmentDetails(PatientAssessmentDetails Model)
        {
            if (!ModelState.IsValid)
                return GetModelStateIsValidException(ModelState);
            try
            {
                GetUserInfo(Model);
                if (Model.PAT_ID > 0)
                {
                    HttpResponseMessage response = await CallPostAPIAsync("ClinicalAPI/SaveAssessmentDetails", Model);

                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        return Json(new
                        {
                            Status = result.Status == "1",
                            Message = result.Message
                        });
                    }
                    else
                    {
                        return Json(new { Status = false, Message = "API Error" });
                    }
                }

                return Json(new { Status = false, Message = "Invalid Patient ID" });
            }
            catch (Exception ex)
            {
                logger.Error("SaveInitialDetails Error: ", ex);
                return Json(new { Status = false, Message = "Exception occurred" });
            }
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> SaveAssessmentPHM(List<PatientAssessmentPHM_CM> Model)
        {
            if (Model == null || Model.Count == 0)
                return Json(new { Status = false, Message = "No data received" });

            if (!ModelState.IsValid)
                return GetModelStateIsValidException(ModelState);

            try
            {
                // ✅ Add user info to all records
                foreach (var item in Model)
                {
                    GetUserInfo(item);

                    if (item.PAT_ID <= 0)
                        return Json(new { Status = false, Message = "Invalid Patient ID" });
                }

                // ✅ SINGLE API CALL (PASS FULL LIST)
                HttpResponseMessage response = await CallPostAPIAsync("ClinicalAPI/SaveAssessmentPHM", Model);  // 🔥 FULL LIST           

                if (!response.IsSuccessStatusCode)
                {
                    return Json(new { Status = false, Message = "API Error" });
                }

                return Json(new { Status = true, Message = "Saved Successfully" });
            }
            catch (Exception ex)
            {
                logger.Error("SavePHM Error: ", ex);
                return Json(new { Status = false, Message = "Exception occurred" });
            }
        }
        public ActionResult StartAssessment(string reg, string name, string age,
                                         string contact, string gender,
                                         string email, string address)
        {
            ViewBag.RegNo = reg;
            ViewBag.Name = name;
            ViewBag.Age = age;
            ViewBag.Contact = contact;
            ViewBag.Gender = gender;
            ViewBag.Email = email;
            ViewBag.Address = address;

            // 👇 Split First & Last Name
            if (!string.IsNullOrEmpty(name))
            {
                var parts = name.Split(' ');
                ViewBag.FirstName = parts[0];
                ViewBag.LastName = parts.Length > 1 ? parts[1] : "";
            }

            return PartialView("_partialStartAssessment");
        }
    }
}
