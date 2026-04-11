using DocPlus.Entities.ViewModels;
using DocPlus.Operations.Repository;
using DocPlus.WebAPI.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DocPlus.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DSM4MasterAPIController : BaseAPIController
    {
        private readonly IDSM4MasterRepository _IDSM4Repo;
        public DSM4MasterAPIController(IDSM4MasterRepository IDSM4Repo)
        {
            _IDSM4Repo = IDSM4Repo;
        }
        [Authorize]
        [HttpPost("GetDSM4MasterList")]
        public async Task<IActionResult> GetDSM4MasterList([FromBody] DSM4_VM model)
        {
            var data = await _IDSM4Repo.GetDSM4MasterList(model);
            return Ok(data);
        }
        [Authorize]
        [HttpPost("AddUpdateDSM4Master")]
        public async Task<IActionResult> AddUpdateDSM4Master([FromBody] DSM4_VM model)
        {
            var result = await _IDSM4Repo.AddUpdateDSM4Master(model);
            return Ok(result);
        }        
        [Authorize]
        [HttpPost("DeleteDSM4Master")]
        public async Task<IActionResult> DeleteDSM4Master([FromBody] int id)
        {
            var result = await _IDSM4Repo.DeleteDSM4Master(id);
            return Ok(result);
        }
        
        [Authorize]
        [HttpGet("GetDSM4MasterDetailsById")]
        public async Task<IActionResult> GetDSM4MasterDetailsById(int id)
        {
            var result = await _IDSM4Repo.GetDSM4MasterDetailsById(id);
            return Ok(result);
        }
    }
}
