using DocPlus.Entities.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;

namespace DocPlus.Controllers
{
    public class ICD10MasterController : BaseController
    {
        public ICD10MasterController(IMemoryCache cache, IConfiguration configuration, IWebHostEnvironment hostingEnvironment) : base(cache, configuration, hostingEnvironment)
        { }
        public ActionResult Index()
        {
            return View();
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> GetICD10MasterList(ICD10_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);

                    HttpResponseMessage response = await CallPostAPIAsync("ICD10MasterAPI/GetICD10MasterList", Model);

                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        var data = JsonConvert.DeserializeObject<List<ICD10_VM>>(result.Data.ToString());

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
        public async Task<JsonResult> AddUpdateICD10Master(ICD10_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);

                    HttpResponseMessage response = await CallPostAPIAsync("ICD10MasterAPI/AddUpdateICD10Master", Model);

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
        public async Task<JsonResult> DeleteICD10Master(int id)
        {
            try
            {
                HttpResponseMessage response =
                    await CallPostAPIAsync("ICD10MasterAPI/DeleteICD10Master", id);

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
        public async Task<JsonResult> GetICD10MasterDetailsById(int id)
        {
            try
            {
                HttpResponseMessage response = await CallGetAPIAsync("ICD10MasterAPI/GetICD10MasterDetailsById?id=" + id);

                if (response.IsSuccessStatusCode)
                {
                    string raw = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<JsonResponse>(raw);
                    var data = JsonConvert.DeserializeObject<ICD10_VM>(result.Data.ToString());
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
