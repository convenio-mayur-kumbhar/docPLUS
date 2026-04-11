using DocPlus.Entities.ViewModels;
using DocPlus.Operations.Repository;
using DocPlus.WebAPI.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DocPlus.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OccupationMasterAPIController : BaseAPIController
    {
        private readonly IOccupationMasterRepository _IOccupationRepo;
        public OccupationMasterAPIController(IOccupationMasterRepository IOccupationRepo)
        {
            _IOccupationRepo = IOccupationRepo;
        }
        [Authorize]
        [HttpPost("GetOccupationMasterList")]
        public async Task<IActionResult> GetOccupationMasterList([FromBody] Occupation_VM model)
        {
            var data = await _IOccupationRepo.GetOccupationMasterList(model);
            return Ok(data);
        }
        [Authorize]
        [HttpPost("AddUpdateOccupationMaster")]
        public async Task<IActionResult> AddUpdateOccupationMaster([FromBody] Occupation_VM model)
        {
            var result = await _IOccupationRepo.AddUpdateOccupationMaster(model);
            return Ok(result);
        }        
        [Authorize]
        [HttpPost("DeleteOccupationMaster")]
        public async Task<IActionResult> DeleteOccupationMaster([FromBody] int id)
        {
            var result = await _IOccupationRepo.DeleteOccupationMaster(id);
            return Ok(result);
        }
        
        [Authorize]
        [HttpGet("GetOccupationMasterDetailsById")]
        public async Task<IActionResult> GetOccupationMasterDetailsById(int id)
        {
            var result = await _IOccupationRepo.GetOccupationMasterDetailsById(id);
            return Ok(result);
        }
    }
}
