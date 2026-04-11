using DocPlus.Entities.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;

namespace DocPlus.Controllers
{
    public class PatientRegistrationsController : BaseController
    {
        public PatientRegistrationsController(IMemoryCache cache, IConfiguration configuration, IWebHostEnvironment HostingEnvironment) : base(cache, configuration, HostingEnvironment)
        { }
        public IActionResult Index()
        {
            return View();
        }
        public PartialViewResult _partialPatientRegistration()
        {
            return PartialView("_partialPatientRegistration");
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> AddUpdate(Patient_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    if (Model.PatientID == 0)
                    {

                        HttpResponseMessage response = await CallPostAPIAsync("PatientAPI/add", Model);
                        var jsonString = await response.Content.ReadAsStringAsync();

                        // ✅ CONVERT TO OBJECT
                        var apiResult = JsonConvert.DeserializeObject<JsonResponse>(jsonString);
                        if (response.IsSuccessStatusCode)
                        {
                            string raw = await response.Content.ReadAsStringAsync();

                            var result = JsonConvert.DeserializeObject<JsonResponse>(raw);
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
                    else
                    {
                        HttpResponseMessage response = await CallPutAPIAsync("PatientAPI/update", Model);
                        var jsonString = await response.Content.ReadAsStringAsync();

                        // ✅ CONVERT TO OBJECT
                        var apiResult = JsonConvert.DeserializeObject<JsonResponse>(jsonString);
                        if (response.IsSuccessStatusCode)
                        {
                            string raw = await response.Content.ReadAsStringAsync();

                            var result = JsonConvert.DeserializeObject<JsonResponse>(raw);
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

                }
                return Json(new { status = "error", message = "Invalid model", data = new { status = false } }
                );
            }
            catch (Exception ex)
            {
                return Json(new { status = "error", message = ex.Message, data = new { status = false } });
            }
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
                    HttpResponseMessage response = await CallGetAPIAsync("PatientAPI/list");
                    if (response.IsSuccessStatusCode)
                    {
                        if (Model.PatientID == 0)
                        {
                            var data = await response.Content.ReadFromJsonAsync<List<Patient_VM>>();
                            return GetDataResponse(data);
                        }
                        else
                        {
                            var data = await response.Content.ReadFromJsonAsync<List<Patient_VM>>();
                            return GetDataResponse(data);
                        }

                    }
                    else return GetDataResponseException(default);
                }
                else
                    return GetModelStateIsValidException(ModelState);
            }
            catch (Exception ex)
            {
                return GetDataResponseException(ex);
            }
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> GetDataByID(Patient_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);
                    HttpResponseMessage response = await CallGetAPIAsync($"PatientAPI/get/{Model.PatientID}");

                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        var data = JsonConvert.DeserializeObject<Patient_VM>(result.Data.ToString());

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
        public async Task<JsonResult> Delete(int PatientID)
        {
            try
            {
                if (PatientID > 0)
                {
                    HttpResponseMessage response = await CallDeleteAPIAsync($"PatientAPI/delete/{PatientID}");
                    var jsonString = await response.Content.ReadAsStringAsync();

                    // ✅ CONVERT TO OBJECT
                    var apiResult = JsonConvert.DeserializeObject<JsonResponse>(jsonString);
                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

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
                return Json(new
                {
                    status = "error",
                    message = "Invalid PatientID",
                    data = new { status = false }
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    status = "error",
                    message = ex.Message,
                    data = new { status = false }
                });
            }
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> AddNOK(PatientNOKDetails Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    HttpResponseMessage response = await CallPostAPIAsync("PatientAPI/addNOK", Model);
                    var jsonString = await response.Content.ReadAsStringAsync();

                    // ✅ CONVERT TO OBJECT
                    var apiResult = JsonConvert.DeserializeObject<JsonResponse>(jsonString);
                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

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

                return Json(new { status = "error", message = "Invalid model", data = new { status = false } }
                );

            }
            catch (Exception ex)
            {
                return Json(new { status = "error", message = ex.Message, data = new { status = false } });
            }
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> DeleteNOK(int NOK_ID, int UserID)
        {
            try
            {
                if (NOK_ID > 0)
                {
                    HttpResponseMessage response = await CallDeleteAPIAsync($"PatientAPI/DeletePatientNOK/{NOK_ID}/{UserID}");
                    var jsonString = await response.Content.ReadAsStringAsync();

                    // ✅ CONVERT TO OBJECT
                    var apiResult = JsonConvert.DeserializeObject<JsonResponse>(jsonString);
                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);
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
                return Json(new
                {
                    status = "error",
                    message = "Invalid NOK_ID",
                    data = new { status = false }
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    status = "error",
                    message = ex.Message,
                    data = new { status = false }
                });
            }
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> AddOP(PatientOPDetails Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    HttpResponseMessage response = await CallPostAPIAsync("PatientAPI/addOP", Model);
                    var jsonString = await response.Content.ReadAsStringAsync();

                    // ✅ CONVERT TO OBJECT
                    var apiResult = JsonConvert.DeserializeObject<JsonResponse>(jsonString);
                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

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
                return Json(new { status = "error", message = "Invalid model", data = new { status = false } });

            }
            catch (Exception ex)
            {
                return Json(new { status = "error", message = ex.Message, data = new { status = false } });
            }
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> DeleteOP(int OP_ID, int UserID)
        {
            try
            {
                if (OP_ID > 0)
                {

                    HttpResponseMessage response = await CallDeleteAPIAsync($"PatientAPI/DeletePatientOP/{OP_ID}/{UserID}");
                    var jsonString = await response.Content.ReadAsStringAsync();

                    // ✅ CONVERT TO OBJECT
                    var apiResult = JsonConvert.DeserializeObject<JsonResponse>(jsonString);
                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);
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
                return Json(new { status = "error", message = "Invalid OP_ID", data = new { status = false } }
                );
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    status = "error",
                    message = ex.Message,
                    data = new { status = false }
                });
            }
        }

    }
}

