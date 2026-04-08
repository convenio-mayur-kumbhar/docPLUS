using DocPlus.Entities.ViewModels;
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
        [Authorize]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeletePatient(int id)
        {
            var result = await _PatientRepo.DeletePatient(id);
            return Ok(result);
        }
        [Authorize]
        [HttpPost("addNOK")]
        public async Task<IActionResult> SavePatientNOK(PatientNOKDetails model)
        {
            var result = await _PatientRepo.SavePatientNOK(model);
            return Ok(result);
        }
        [Authorize]
        [HttpPost("addOP")]
        public async Task<IActionResult> SavePatientOP(PatientOPDetails model)
        {
            var result = await _PatientRepo.SavePatientOP(model);
            return Ok(result);
        }
        [Authorize]
        [HttpDelete("DeletePatientNOK/{id}/{userId}")]
        public async Task<IActionResult> DeletePatientNOK(int id, int userId)
        {
            var result = await _PatientRepo.DeletePatientNOK(id, userId);
            return Ok(result);
        }
        [Authorize]
        [HttpDelete("DeletePatientOP")]
        public async Task<IActionResult> DeletePatientOP(int id, int userId)
        {
            var result = await _PatientRepo.DeletePatientOP(id, userId);
            return Ok(result);
        }
    }
}
