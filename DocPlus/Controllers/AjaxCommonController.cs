using DocPlus.Entities.ClinicalModels;
using DocPlus.Entities.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;

namespace DocPlus.Controllers
{
    public class AjaxCommonController : BaseController
    {
        public AjaxCommonController(IMemoryCache cache, IConfiguration configuration, IWebHostEnvironment hostingEnvironment) : base(cache, configuration, hostingEnvironment)
        { }
        [HttpPost]
        public async Task<JsonResult> GetCategoryMaster(MasterDropDown Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);

                    HttpResponseMessage response = await CallGetAPIAsync("AjaxCommonAPI/GetCategoryMaster");

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
        public async Task<JsonResult> GetMaritalStatusMaster(MasterDropDown Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);
                    HttpResponseMessage response = await CallGetAPIAsync("AjaxCommonAPI/GetMaritalStatusMaster");

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
        public async Task<JsonResult> GetStatusMaster(MasterDropDown Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);
                    HttpResponseMessage response = await CallGetAPIAsync("AjaxCommonAPI/GetStatusMaster");

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
        public async Task<JsonResult> GetOccupationMaster(MasterDropDown Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);
                    HttpResponseMessage response = await CallGetAPIAsync("AjaxCommonAPI/GetOccupationMaster");

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
        public async Task<JsonResult> GetProfessionMaster(MasterDropDown Model)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    GetUserInfo(Model);
                    HttpResponseMessage response = await CallGetAPIAsync("AjaxCommonAPI/GetProfessionMaster");

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
    }
}
