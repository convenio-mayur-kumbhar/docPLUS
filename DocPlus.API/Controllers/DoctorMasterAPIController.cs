using DocPlus.Entities.ViewModels;
using DocPlus.Operations.Repository;
using DocPlus.WebAPI.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DocPlus.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorMasterAPIController : BaseAPIController
    {
        private readonly IDoctorMasterRepository _IDocRepo;
        public DoctorMasterAPIController(IDoctorMasterRepository IDocRepo)
        {
            _IDocRepo = IDocRepo;
        }
        [Authorize]
        [HttpPost("GetDoctorList")]
        public async Task<IActionResult> GetDoctorList([FromBody] Doctor_VM model)
        {
            var data = await _IDocRepo.GetDoctorList(model);
            return Ok(data);
        }
        [Authorize]
        [HttpPost("AddUpdateDoctorMaster")]
        public async Task<IActionResult> AddUpdateDoctorMaster([FromBody] Doctor_VM model)
        {
            var result = await _IDocRepo.AddUpdateDoctorMaster(model);
            return Ok(result);
        }        
        [Authorize]
        [HttpPost("DeleteDoctorMaster")]
        public async Task<IActionResult> DeleteDoctorMaster([FromBody] int id)
        {
            var result = await _IDocRepo.DeleteDoctorMaster(id);
            return Ok(result);
        }
        
        [Authorize]
        [HttpGet("GetDoctorMasterDetailsById")]
        public async Task<IActionResult> GetDoctorMasterDetailsById(int id)
        {
            var result = await _IDocRepo.GetDoctorMasterDetailsById(id);
            return Ok(result);
        }
    }
}
