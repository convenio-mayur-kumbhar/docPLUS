using DocPlus.Entities.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;

namespace DocPlus.Controllers
{
    public class CategoryMasterController : BaseController
    {
        public CategoryMasterController(IMemoryCache cache, IConfiguration configuration, IWebHostEnvironment hostingEnvironment) : base(cache, configuration, hostingEnvironment)
        { }
        public ActionResult Index()
        {
            return View();
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<JsonResult> GetCategoryList(Category_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);

                    HttpResponseMessage response = await CallPostAPIAsync("CategoryMasterAPI/GetCategoryMasterList", Model);

                    if (response.IsSuccessStatusCode)
                    {
                        string raw = await response.Content.ReadAsStringAsync();

                        var result = JsonConvert.DeserializeObject<JsonResponse>(raw);

                        var data = JsonConvert.DeserializeObject<List<Category_VM>>(result.Data.ToString());

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
        public async Task<JsonResult> AddUpdateCategory(Category_VM Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);

                    HttpResponseMessage response = await CallPostAPIAsync("CategoryMasterAPI/AddUpdateCategoryMaster", Model);

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
        public async Task<JsonResult> DeleteCategory(int id)
        {
            try
            {
                HttpResponseMessage response =
                    await CallPostAPIAsync("CategoryMasterAPI/DeleteCategoryMaster", id);

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
        public async Task<JsonResult> GetCategoryDetailsById(int CategoryID)
        {
            try
            {
                HttpResponseMessage response = await CallGetAPIAsync("CategoryMasterAPI/GetCategoryMasterDetailsById?id=" + CategoryID);

                if (response.IsSuccessStatusCode)
                {
                    string raw = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<JsonResponse>(raw);
                    var data = JsonConvert.DeserializeObject<Category_VM>(result.Data.ToString());
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
