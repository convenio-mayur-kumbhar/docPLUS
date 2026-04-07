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
    public class AppointmentAPIController : BaseAPIController
    {
        private readonly IAppointmentRepository _IAppointmentRepo;
        public AppointmentAPIController(IAppointmentRepository IAppointmentRepo)
        {
            _IAppointmentRepo = IAppointmentRepo;
        }
        [Authorize]
        [HttpPost("AllAppointmentList")]
        public async Task<IActionResult> GetAppointmentList([FromBody] Appointment_VM model)
        {
            var data = await _IAppointmentRepo.GetAppointmentList(model);
            return Ok(data);
        }
        [Authorize]
        [HttpPost("AddAppointment")]
        public async Task<IActionResult> AddAppointment([FromBody] Appointment_VM model)
        {
            var result = await _IAppointmentRepo.AddUpdateAppointment(model);
            return Ok(result);
        }
        
        [Authorize]
        [HttpPost("DeleteAppointment")]
        public async Task<IActionResult> DeleteAppointment([FromBody] int id)
        {
            var result = await _IAppointmentRepo.DeleteAppointment(id);
            return Ok(result);
        }
        [Authorize]
        [HttpGet("PatientDropdown")]
        public async Task<IActionResult> GetPatientDropdown()
        {
            var result = await _IAppointmentRepo.GetPatientDropdown();
            return Ok(result);
        }
        [Authorize]
        [HttpGet("GetAppointmentDetailsById")]
        public async Task<IActionResult> GetAppointmentDetailsById(int id)
        {
            var result = await _IAppointmentRepo.GetAppointmentDetailsById(id);
            return Ok(result);
        }
    }
}
