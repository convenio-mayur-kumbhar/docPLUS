using DocPlus.Entities.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;

namespace DocPlus.Controllers
{
    public class DSM4MasterController : BaseController
    {
        public DSM4MasterController(IMemoryCache cache, IConfiguration configuration, IWebHostEnvironment hostingEnvironment) : base(cache, configuration, hostingEnvironment)
        { }
        public ActionResult Index()
        {
            return View();
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> GetDSM4MasterList(DSM4_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);

                    HttpResponseMessage response = await CallPostAPIAsync("DSM4MasterAPI/GetDSM4MasterList", Model);

                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        var data = JsonConvert.DeserializeObject<List<DSM4_VM>>(result.Data.ToString());

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
        public async Task<JsonResult> AddUpdateDSM4Master(DSM4_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);

                    HttpResponseMessage response = await CallPostAPIAsync("DSM4MasterAPI/AddUpdateDSM4Master", Model);

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
        public async Task<JsonResult> DeleteDSM4Master(int id)
        {
            try
            {
                HttpResponseMessage response =
                    await CallPostAPIAsync("DSM4MasterAPI/DeleteDSM4Master", id);

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
        public async Task<JsonResult> GetDSM4MasterDetailsById(int id)
        {
            try
            {
                HttpResponseMessage response = await CallGetAPIAsync("DSM4MasterAPI/GetDSM4MasterDetailsById?id=" + id);

                if (response.IsSuccessStatusCode)
                {
                    string raw = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<JsonResponse>(raw);
                    var data = JsonConvert.DeserializeObject<DSM4_VM>(result.Data.ToString());
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
