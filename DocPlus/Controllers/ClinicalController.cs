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
