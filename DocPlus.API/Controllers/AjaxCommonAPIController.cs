using DocPlus.Entities.ClinicalModels;
using DocPlus.Entities.ViewModels;
using DocPlus.Operations.Repository;
using DocPlus.WebAPI.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DocPlus.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AjaxCommonAPIController : BaseAPIController
    {
        private readonly IAjaxCommonRepository _AjaxCommonRepo;
        public AjaxCommonAPIController(IAjaxCommonRepository AjaxCommonRepo)
        {
            _AjaxCommonRepo = AjaxCommonRepo;
        }

        [Authorize]
        [HttpGet("GetCategoryMaster")]
        public async Task<IActionResult> GetCategoryMaster()
        {
            var data = await _AjaxCommonRepo.GetCategoryMaster();
            return Ok(data);
        }

        [Authorize]
        [HttpGet("GetMaritalStatusMaster")]
        public async Task<IActionResult> GetMaritalStatusMaster()
        {
            var data = await _AjaxCommonRepo.GetMaritalStatusMaster();
            return Ok(data);
        }

        [Authorize]
        [HttpGet("GetStatusMaster")]
        public async Task<IActionResult> GetStatusMaster()
        {
            var data = await _AjaxCommonRepo.GetStatusMaster();
            return Ok(data);
        }

        [Authorize]
        [HttpGet("GetOccupationMaster")]
        public async Task<IActionResult> GetOccupationMaster()
        {
            var data = await _AjaxCommonRepo.GetOccupationMaster();
            return Ok(data);
        }

        [Authorize]
        [HttpGet("GetProfessionMaster")]
        public async Task<IActionResult> GetProfessionMaster()
        {
            var data = await _AjaxCommonRepo.GetProfessionMaster();
            return Ok(data);
        }
    }
}
