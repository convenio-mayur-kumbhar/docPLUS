using DocPlus.Entities.ViewModels;
using DocPlus.Operations.Repository;
using DocPlus.WebAPI.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DocPlus.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ICD10MasterAPIController : BaseAPIController
    {
        private readonly IICD10MasterRepository _IICD10Repo;
        public ICD10MasterAPIController(IICD10MasterRepository IICD10Repo)
        {
            _IICD10Repo = IICD10Repo;
        }
        [Authorize]
        [HttpPost("GetICD10MasterList")]
        public async Task<IActionResult> GetICD10MasterList([FromBody] ICD10_VM model)
        {
            var data = await _IICD10Repo.GetICD10MasterList(model);
            return Ok(data);
        }
        [Authorize]
        [HttpPost("AddUpdateICD10Master")]
        public async Task<IActionResult> AddUpdateICD10Master([FromBody] ICD10_VM model)
        {
            var result = await _IICD10Repo.AddUpdateICD10Master(model);
            return Ok(result);
        }        
        [Authorize]
        [HttpPost("DeleteICD10Master")]
        public async Task<IActionResult> DeleteICD10Master([FromBody] int id)
        {
            var result = await _IICD10Repo.DeleteICD10Master(id);
            return Ok(result);
        }
        
        [Authorize]
        [HttpGet("GetICD10MasterDetailsById")]
        public async Task<IActionResult> GetICD10MasterDetailsById(int id)
        {
            var result = await _IICD10Repo.GetICD10MasterDetailsById(id);
            return Ok(result);
        }
    }
}
