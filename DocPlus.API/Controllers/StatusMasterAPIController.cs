using DocPlus.Entities.ViewModels;
using DocPlus.Operations.Repository;
using DocPlus.WebAPI.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DocPlus.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatusMasterAPIController : BaseAPIController
    {
        private readonly IStatusMasterRepository _IStatusRepo;
        public StatusMasterAPIController(IStatusMasterRepository IStatusRepo)
        {
            _IStatusRepo = IStatusRepo;
        }
        [Authorize]
        [HttpPost("GetStatusMasterList")]
        public async Task<IActionResult> GetStatusMasterList([FromBody] Status_VM model)
        {
            var data = await _IStatusRepo.GetStatusMasterList(model);
            return Ok(data);
        }
        [Authorize]
        [HttpPost("AddUpdateStatusMaster")]
        public async Task<IActionResult> AddUpdateStatusMaster([FromBody] Status_VM model)
        {
            var result = await _IStatusRepo.AddUpdateStatusMaster(model);
            return Ok(result);
        }        
        [Authorize]
        [HttpPost("DeleteStatusMaster")]
        public async Task<IActionResult> DeleteStatusMaster([FromBody] int id)
        {
            var result = await _IStatusRepo.DeleteStatusMaster(id);
            return Ok(result);
        }
        
        [Authorize]
        [HttpGet("GetStatusMasterDetailsById")]
        public async Task<IActionResult> GetStatusMasterDetailsById(int id)
        {
            var result = await _IStatusRepo.GetStatusMasterDetailsById(id);
            return Ok(result);
        }
    }
}
