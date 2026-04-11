using DocPlus.Entities.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;

namespace DocPlus.Controllers
{
    public class OccupationMasterController : BaseController
    {
        public OccupationMasterController(IMemoryCache cache, IConfiguration configuration, IWebHostEnvironment hostingEnvironment) : base(cache, configuration, hostingEnvironment)
        { }
        public ActionResult Index()
        {
            return View();
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> GetOccupationList(Occupation_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);

                    HttpResponseMessage response = await CallPostAPIAsync("OccupationMasterAPI/GetOccupationMasterList", Model);

                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        var data = JsonConvert.DeserializeObject<List<Occupation_VM>>(result.Data.ToString());

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
        public async Task<JsonResult> AddUpdateOccupation(Occupation_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);

                    HttpResponseMessage response = await CallPostAPIAsync("OccupationMasterAPI/AddUpdateOccupationMaster", Model);

                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        return GetDataResponse(result);
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
        public async Task<JsonResult> DeleteOccupation(int id)
        {
            try
            {
                HttpResponseMessage response =
                    await CallPostAPIAsync("OccupationMasterAPI/DeleteOccupationMaster", id);

                if (response.IsSuccessStatusCode)
                {
                    string raw = await response.Content.ReadAsStringAsync();

                    var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                    return GetDataResponse(result);
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
        [HttpPost]
        public async Task<JsonResult> GetOccupationDetailsById(int OccupationID)
        {
            try
            {
                HttpResponseMessage response = await CallGetAPIAsync("OccupationMasterAPI/GetOccupationMasterDetailsById?id=" + OccupationID);

                if (response.IsSuccessStatusCode)
                {
                    string raw = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<JsonResponse>(raw);
                    var data = JsonConvert.DeserializeObject<Occupation_VM>(result.Data.ToString());
                    return GetDataResponse(data!);
                }

                return GetDataResponseException(default!);
            }
            catch (Exception ex)
            {
                return GetDataResponseException(ex);
            }
        }

    }
}
