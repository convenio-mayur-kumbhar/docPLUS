using DocPlus.Entities.ViewModels;
using DocPlus.Operations.Repository;
using DocPlus.WebAPI.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DocPlus.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientAPIController : BaseAPIController
    {
        private readonly IPatientRepository _PatientRepo;
        public PatientAPIController(IPatientRepository PatientRepo)
        {
            _PatientRepo = PatientRepo;
        }
        // ✅ ADD
        [Authorize]
        [HttpPost("add")]
        public async Task<IActionResult> AddPatient(Patient_VM model)
        {
            var result = await _PatientRepo.AddPatient(model);
            return Ok(result);
        }
        // ✅ UPDATE
        [Authorize]
        [HttpPut("update")]
        public async Task<IActionResult> UpdatePatient(Patient_VM model)
        {
            var result = await _PatientRepo.UpdatePatient(model);
            return Ok(result);
        }
        // ✅ GET LIST
        [Authorize]
        [HttpGet("list")]
        public async Task<IActionResult> GetAllPatients()
        {
            var data = await _PatientRepo.GetAllPatients();
            return Ok(data);
        }
        [Authorize]
        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetPatientById(int id)
        {
            var result = await _PatientRepo.GetPatientById(id);
            return Ok(result);
        }
    }
}
