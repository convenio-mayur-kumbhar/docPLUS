using DocPlus.Entities.ClinicalModels;
using DocPlus.Entities.ViewModels;
using DocPlus.Operations.Repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using System.Net.Http;
using System.Reflection;

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
        public async Task<JsonResult> AddUpdate(Patient_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    HttpResponseMessage response;
                    string operationType = String.Empty;
                    if (Model.PatientID == 0)
                    {
                        response = await CallPostAPIAsync("PatientAPI/add", Model);
                        operationType = "Add";
                        return GetAddEditDeleteResponse(Response, operationType);
                    }
                    else if (Model.PatientID > 0)
                    {
                        response = await CallPutAPIAsync("PatientAPI/update", Model);
                        operationType = "Update";
                        return GetAddEditDeleteResponse(Response, operationType);
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

        public async Task<JsonResult> Delete(int PatientID)
        {
            try
            {
                if (PatientID > 0)
                {
                    HttpResponseMessage response = await CallDeleteAPIAsync($"PatientAPI/delete/{PatientID}");
                    if (response.IsSuccessStatusCode)
                    {
                        return Json(new
                        {
                            status = "success",message = "Patient deleted successfully",data = new { status = true }
                        });
                    }
                    else
                    {
                        return Json(new
                        {
                            status = "error",message = "Delete API failed",data = new { status = false }
                        });
                    }
                }
                return Json(new
                {
                    status = "error",message = "Invalid PatientID",data = new { status = false }  
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    status = "error",message = ex.Message, data = new { status = false } 
                });
            }
        }

        public async Task<JsonResult> AddNOK(PatientNOKDetails Model)
        {
            try
            {
                if (ModelState.IsValid)
                {    
                    HttpResponseMessage response;
                    string operationType = String.Empty;
                    if (Model.NOK_ID >= 0 && Model.PAT_ID > 0)
                    {
                        response = await CallPostAPIAsync("PatientAPI/addNOK", Model);
                        operationType = "Add";
                        return GetAddEditDeleteResponse(Response, operationType);
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

        public async Task<JsonResult> DeleteNOK(int NOK_ID, int UserID)
        {
            try
            {
                if (NOK_ID > 0)
                {
                      HttpResponseMessage response = await CallDeleteAPIAsync($"PatientAPI/DeletePatientNOK/{NOK_ID}/{UserID}");
                    
                    if (response.IsSuccessStatusCode)
                    {
                        return Json(new
                        {
                            status = "success", message = "NOK deleted successfully",data = new { status = true }
                        });
                    }
                    else
                    {
                        return Json(new
                        {
                            status = "error", message = "Delete API failed",data = new { status = false }                            
                        });
                    }
                }
                return Json(new
                {
                    status = "error", message = "Invalid NOK_ID", data = new { status = false }
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    status = "error", message = ex.Message, data = new { status = false }
                });
            }
        }
        public async Task<JsonResult> AddOP(PatientOPDetails Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    HttpResponseMessage response;
                    string operationType = String.Empty;
                    if (Model.OP_ID >= 0 && Model.PAT_ID > 0)
                    {
                        response = await CallPostAPIAsync("PatientAPI/addOP", Model);
                        operationType = "Add";
                        return GetAddEditDeleteResponse(Response, operationType);
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

    }
}

