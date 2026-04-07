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
    public class ProfessionMasterAPIController : BaseAPIController
    {
        private readonly IProfessionMasterRepository _IProfessionRepo;
        public ProfessionMasterAPIController(IProfessionMasterRepository IProfessionRepo)
        {
            _IProfessionRepo = IProfessionRepo;
        }
        [Authorize]
        [HttpPost("GetProfessionMasterList")]
        public async Task<IActionResult> GetProfessionMasterList([FromBody] Profession_VM model)
        {
            var data = await _IProfessionRepo.GetProfessionMasterList(model);
            return Ok(data);
        }
        [Authorize]
        [HttpPost("AddUpdateProfessionMaster")]
        public async Task<IActionResult> AddUpdateProfessionMaster([FromBody] Profession_VM model)
        {
            var result = await _IProfessionRepo.AddUpdateProfessionMaster(model);
            return Ok(result);
        }        
        [Authorize]
        [HttpPost("DeleteProfessionMaster")]
        public async Task<IActionResult> DeleteProfessionMaster([FromBody] int id)
        {
            var result = await _IProfessionRepo.DeleteProfessionMaster(id);
            return Ok(result);
        }
        
        [Authorize]
        [HttpGet("GetProfessionMasterDetailsById")]
        public async Task<IActionResult> GetProfessionMasterDetailsById(int id)
        {
            var result = await _IProfessionRepo.GetProfessionMasterDetailsById(id);
            return Ok(result);
        }
    }
}
