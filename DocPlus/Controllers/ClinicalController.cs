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
        public async Task<JsonResult> GetClinicalDetailsByPatientId(Patient_VM Model)
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
        public async Task<JsonResult> GetClinicalInitailsDetailsByPatientID(Patient_VM Model, string Ass_value)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);
                    HttpResponseMessage response = await CallGetAPIAsync($"ClinicalAPI/GetClinicalInitailsDetailsByPatientID/{Model.PatientID}/{Ass_value}");

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
        public async Task<JsonResult> GetClinicalAssetmentsDetailsByPatientID(Patient_VM Model, string Ass_value, int filterType)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);
                    HttpResponseMessage response = await CallGetAPIAsync($"ClinicalAPI/GetClinicalAssetmentsDetailsByPatientID/{Model.PatientID}/{Ass_value}/{filterType}");

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
        public async Task<JsonResult> GetClinicalPHMDetailsByPatientID(Patient_VM Model, int filterType)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);
                    HttpResponseMessage response = await CallGetAPIAsync($"ClinicalAPI/GetClinicalPHMDetailsByPatientID/{Model.PatientID}/{filterType}");

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
                    var jsonString = await response.Content.ReadAsStringAsync();

                    // ✅ CONVERT TO OBJECT
                    var apiResult = JsonConvert.DeserializeObject<JsonResponse>(jsonString);
                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        //return Json(new { Status = true, Message = "Saved Successfully"
                        return Json(new
                        {
                            Status = apiResult.Status == "1",
                            Message = apiResult.Message
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
                    var jsonString = await response.Content.ReadAsStringAsync();

                    // ✅ CONVERT TO OBJECT
                    var apiResult = JsonConvert.DeserializeObject<JsonResponse>(jsonString);
                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        //return Json(new { Status = true, Message = "Saved Successfully"
                        return Json(new
                        {
                            Status = apiResult.Status == "1",
                            Message = apiResult.Message
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
                                                                                                                // ✅ READ JSON FROM API
                var jsonString = await response.Content.ReadAsStringAsync();

                // ✅ CONVERT TO OBJECT
                var apiResult = JsonConvert.DeserializeObject<JsonResponse>(jsonString);
                if (!response.IsSuccessStatusCode)
                {
                    return Json(new { Status = false, Message = "API Error" });
                }

                //return Json(new { Status = true, Message = "Saved Successfully"
                return Json(new
                {
                    Status = apiResult.Status == "1",
                    Message = apiResult.Message
                });
                // });
            }
            catch (Exception ex)
            {
                logger.Error("SavePHM Error: ", ex);
                return Json(new { Status = false, Message = "Exception occurred" });
            }
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> GetGetInpatientByPatientID(Patient_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);
                    HttpResponseMessage response = await CallGetAPIAsync($"ClinicalAPI/GetGetInpatientByPatientID/{Model.PatientID}");

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
        public async Task<JsonResult> SaveInPatients(PatientInpatient_CM Model)
        {
            if (!ModelState.IsValid)
                return GetModelStateIsValidException(ModelState);
            try
            {
                GetUserInfo(Model);
                if (Model.PAT_ID > 0)
                {
                    HttpResponseMessage response = await CallPostAPIAsync("ClinicalAPI/SaveInpatientDetails", Model);
                    var jsonString = await response.Content.ReadAsStringAsync();

                    // ✅ CONVERT TO OBJECT
                    var apiResult = JsonConvert.DeserializeObject<JsonResponse>(jsonString);
                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        //return Json(new { Status = true, Message = "Saved Successfully"
                        return Json(new
                        {
                            Status = apiResult.Status == "1",
                            Message = apiResult.Message
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
        public async Task<JsonResult> GetDSM4_ICD10MasterData(string type)
        {
            try
            {
                Patient_VM Model = new Patient_VM();
                if (ModelState.IsValid)
                {

                    GetUserInfo(Model);
                    HttpResponseMessage response = await CallGetAPIAsync($"ClinicalAPI/GetDSM4_ICD10MasterData/{type}");

                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        // ✅ Step 1: Deserialize into DTO
                        var dtoData = JsonConvert.DeserializeObject<List<MasterDropdownDto>>(result.Data.ToString());

                        // ✅ Step 2: Map DTO → UI Model
                        var data = dtoData.Select(x => new MasterDropDown
                        {
                            Value = x.ID,
                            Text = x.DisplayText
                        }).ToList();

                        return Json(new
                        {
                            status = "Success",
                            data = data
                        });
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
        public async Task<JsonResult> SaveICD10Details(PatientICD10_CM Model)
        {
            if (!ModelState.IsValid)
                return GetModelStateIsValidException(ModelState);
            try
            {
                GetUserInfo(Model);
                if (Model.PAT_ID > 0)
                {
                    HttpResponseMessage response = await CallPostAPIAsync("ClinicalAPI/SaveICD10Details", Model);
                    var jsonString = await response.Content.ReadAsStringAsync();

                    // ✅ CONVERT TO OBJECT
                    var apiResult = JsonConvert.DeserializeObject<JsonResponse>(jsonString);
                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        //return Json(new { Status = true, Message = "Saved Successfully"
                        return Json(new
                        {
                            Status = apiResult.Status == "1",
                            Message = apiResult.Message
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
        public async Task<JsonResult> GetICD10DetailsByID(int PatientID, string filterType)
        {
            try
            {
                HttpResponseMessage response = await CallGetAPIAsync($"ClinicalAPI/GetPatientICD10Timeline/{PatientID}");
                if (response.IsSuccessStatusCode)
                {
                    string raw = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<JsonResponse>(raw);
                    var data = JsonConvert.DeserializeObject<List<PatientICD10Timeline_CM>>(result.Data.ToString());
                    return GetDataResponse(data!);
                }
                else
                {
                    return GetDataResponseException(default!);
                }
            }
            catch (Exception ex)
            {
                logger.Error("GetICD10DetailsByID Error", ex);
                return Json(new { status = "Error" });
            }
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> SaveDSM4Details(PatientDSM4_CM Model)
        {
            if (!ModelState.IsValid)
                return GetModelStateIsValidException(ModelState);
            try
            {
                GetUserInfo(Model);
                if (Model.PAT_ID > 0)
                {
                    HttpResponseMessage response = await CallPostAPIAsync("ClinicalAPI/SaveDSM4Details", Model);
                    var jsonString = await response.Content.ReadAsStringAsync();

                    // ✅ CONVERT TO OBJECT
                    var apiResult = JsonConvert.DeserializeObject<JsonResponse>(jsonString);
                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        //return Json(new { Status = true, Message = "Saved Successfully"
                        return Json(new
                        {
                            Status = apiResult.Status == "1",
                            Message = apiResult.Message
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
        public async Task<JsonResult> GetDSM4DetailsByID(int PatientID)
        {
            try
            {
                HttpResponseMessage response = await CallGetAPIAsync($"ClinicalAPI/GetPatientDSM4Timeline/{PatientID}");
                if (response.IsSuccessStatusCode)
                {
                    string raw = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<JsonResponse>(raw);
                    var data = JsonConvert.DeserializeObject<List<PatientDSM4Timeline_CM>>(result.Data.ToString());
                    return GetDataResponse(data!);
                }
                else
                {
                    return GetDataResponseException(default!);
                }
            }
            catch (Exception ex)
            {
                logger.Error("GetDSM4DetailsByID Error", ex);
                return Json(new { status = "Error" });
            }
        }
    }
}
