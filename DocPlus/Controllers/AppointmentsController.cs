using DocPlus.Entities.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using System.Reflection;

namespace DocPlus.Controllers
{
    public class AppointmentsController : BaseController
    {
        public AppointmentsController(IMemoryCache cache, IConfiguration configuration, IWebHostEnvironment hostingEnvironment)
            : base(cache, configuration, hostingEnvironment)
        { }
        public ActionResult Index()
        {
            return View();
        }
        // Get Appointment List
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> GetAppointmentList(Appointment_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);

                    HttpResponseMessage response = await CallPostAPIAsync("AppointmentAPI/AllAppointmentList", Model);

                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        var data = JsonConvert.DeserializeObject<List<Appointment_VM>>(result.Data.ToString());

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
        // Add Appointment
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> AddAppointment(Appointment_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);

                    HttpResponseMessage response = await CallPostAPIAsync("AppointmentAPI/AddAppointment", Model);
                    var jsonString = await response.Content.ReadAsStringAsync();
                    var apiResult = JsonConvert.DeserializeObject<JsonResponse>(jsonString);

                    if (response.IsSuccessStatusCode)
                    {
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
        public async Task<JsonResult> DeleteAppointment(int id)
        {
            try
            {
                HttpResponseMessage response = await CallPostAPIAsync("AppointmentAPI/DeleteAppointment", id);
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
            catch (Exception ex)
            {
                return GetDataResponseException(ex);
            }
        }
        [HttpPost]
        public async Task<JsonResult> GetAppointmentDetailsById(int AppointmentID)
        {
            try
            {
                HttpResponseMessage response = await CallGetAPIAsync("AppointmentAPI/GetAppointmentDetailsById?id=" + AppointmentID);

                if (response.IsSuccessStatusCode)
                {
                    string raw = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<JsonResponse>(raw);
                    var data = JsonConvert.DeserializeObject<Appointment_VM>(result.Data.ToString());
                    return GetDataResponse(data!);
                }

                return GetDataResponseException(default!);
            }
            catch (Exception ex)
            {
                return GetDataResponseException(ex);
            }
        }
        // Patient Dropdown
        [HttpGet]
        public async Task<JsonResult> GetPatientDropdown()
        {
            try
            {
                HttpResponseMessage response = await CallGetAPIAsync("AppointmentAPI/PatientDropdown");

                if (response.IsSuccessStatusCode)
                {
                    string raw = await response.Content.ReadAsStringAsync();

                    var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                    var data = JsonConvert.DeserializeObject<List<Patient_DropDown>>(result.Data.ToString());

                    return GetDataResponse(data!);
                }
                else
                {
                    return GetDataResponseException(default!);
                }
            }
            catch (Exception ex)
            {
                return GetDataResponseException(ex);
            }
        }
    }
}