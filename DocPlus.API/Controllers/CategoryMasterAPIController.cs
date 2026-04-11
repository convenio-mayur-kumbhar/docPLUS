using DocPlus.Entities.ViewModels;
using DocPlus.Operations.Repository;
using DocPlus.WebAPI.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DocPlus.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryMasterAPIController : BaseAPIController
    {
        private readonly ICategoryMasterRepository _ICategoryRepo;
        public CategoryMasterAPIController(ICategoryMasterRepository ICategoryRepo)
        {
            _ICategoryRepo = ICategoryRepo;
        }
        [Authorize]
        [HttpPost("GetCategoryMasterList")]
        public async Task<IActionResult> GetCategoryMasterList([FromBody] Category_VM model)
        {
            var data = await _ICategoryRepo.GetCategoryMasterList(model);
            return Ok(data);
        }
        [Authorize]
        [HttpPost("AddUpdateCategoryMaster")]
        public async Task<IActionResult> AddUpdateCategoryMaster([FromBody] Category_VM model)
        {
            var result = await _ICategoryRepo.AddUpdateCategoryMaster(model);
            return Ok(result);
        }        
        [Authorize]
        [HttpPost("DeleteCategoryMaster")]
        public async Task<IActionResult> DeleteCategoryMaster([FromBody] int id)
        {
            var result = await _ICategoryRepo.DeleteCategoryMaster(id);
            return Ok(result);
        }
        
        [Authorize]
        [HttpGet("GetCategoryMasterDetailsById")]
        public async Task<IActionResult> GetCategoryMasterDetailsById(int id)
        {
            var result = await _ICategoryRepo.GetCategoryMasterDetailsById(id);
            return Ok(result);
        }
    }
}
