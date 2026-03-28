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
    public class ClinicalAPIController : BaseAPIController
    {
        private readonly IClinicalRepository _ClinicalRepo;
        public ClinicalAPIController(IClinicalRepository ClinicalRepo)
        {
            _ClinicalRepo = ClinicalRepo;
        }
        [Authorize]
        [HttpPost("ClinicalPatientsList")]
        public async Task<IActionResult> ClinicalPatientsList([FromBody] Patient_VM model)
        {
            var data = await _ClinicalRepo.GetPatientsList(model);
            return Ok(data);
        }
        [Authorize]
        [HttpGet("GetClinicalDetailsByPatientId/{id}")]
        public async Task<IActionResult> GetClinicalDetailsByPatientId(int id)
        {
            var result = await _ClinicalRepo.GetClinicalDetailsByPatientID(id);
            return Ok(result);
        }
        [Authorize]
        [HttpGet("GetDSM4_ICD10MasterData")]
        public async Task<IActionResult> GetDSM4_ICD10MasterData(string type)
        {
            var data = await _ClinicalRepo.GetDSM4_ICD10MasterData(type);
            return Ok(data);
        }
        [Authorize]
        [HttpPost("SaveInitialDetails")]
        public async Task<IActionResult> SaveInitialDetails(PatientInitialDetails_CM model)
        {
            await _ClinicalRepo.SaveInitialDetails(model);
            return Ok("Saved successfully");
        }
        [Authorize]
        [HttpPost("SaveAssessmentDetails")]
        public async Task<IActionResult> SaveAssessment(PatientAssessmentDetails model)
        {
            var result = await _ClinicalRepo.SaveAssessmentDetail(model);
            return Ok(result);
        }
        [Authorize]
        [HttpPost("SaveICD10Details")]
        public async Task<IActionResult> SaveICD10Details(PatientICD10_CM model)
        {
            var result = await _ClinicalRepo.SaveICD10Details(model);
            return Ok(result);
        }
        [Authorize]
        [HttpPost("SaveDSM4Details")]
        public async Task<IActionResult> SaveDSM4Details(PatientDSM4_CM model)
        {
            var result = await _ClinicalRepo.SaveDSM4Details(model);
            return Ok(result);
        }
        [Authorize]
        [HttpGet("GetRiskIndicatorsMasterData")]
        public async Task<IActionResult> GetRiskIndicatorsMasterData()
        {
            var data = await _ClinicalRepo.GetRiskMaster();
            return Ok(data);
        }
        [Authorize]
        [HttpGet("RiskIndicatorsDetailsByPatientID/{patId}")]
        public async Task<IActionResult> RiskIndicatorsDetailsByPatientID(int patId)
        {
            var data = await _ClinicalRepo.GetRiskIndicators(patId);
            return Ok(data);
        }
        [Authorize]
        [HttpPost("SaveRiskIndicatorsDetails")]
        public async Task<IActionResult> SaveRiskIndicatorsDetails(PatientRiskSave_CM model)
        {
            var result = await _ClinicalRepo.SaveRiskDetails(model);
            return Ok(result);
        }
        [Authorize]
        [HttpPost("SavePrescriptionDetails")]
        public async Task<IActionResult> SavePrescriptionDetails(PatientPrescription_CM model)
        {
            var result = await _ClinicalRepo.SavePrescription(model);
            return Ok(result);
        }
        [Authorize]
        [HttpGet("GetPrescriptionDates/{patId}")]
        public async Task<IActionResult> GetPrescriptionDates(int patId)
        {
            var data = await _ClinicalRepo.GetPrescriptionDates(patId);
            return Ok(data);
        }
        [Authorize]
        [HttpGet("GetPrescriptionOldData/{patId}/{assDate}")]
        public async Task<IActionResult> GetPrescriptionOldData(int patId, DateTime assDate)
        {
            var data = await _ClinicalRepo.GetPrescriptionByDate(patId, assDate);
            return Ok(data);
        }
        [Authorize]
        [HttpPost("SaveInpatientDetails")]
        public async Task<IActionResult> SaveInpatientDetails(PatientInpatient_CM model)
        {
            var res = await _ClinicalRepo.SaveInpatient(model);
            return Ok(res);
        }
        [Authorize]
        [HttpGet("GetGetInpatientByPatientID/{patId}")]
        public async Task<IActionResult> GetGetInpatientByPatientID(int patId)
        {
            var res = await _ClinicalRepo.GetInpatient(patId);
            return Ok(res);
        }
        [Authorize]
        [HttpPost("SavePatientAttachment")]
        public async Task<IActionResult> SavePatientAttachment(PatientAttachment_CM model)
        {
            var res = await _ClinicalRepo.SaveAttachments(model);
            return Ok(res);
        }
        [Authorize]
        [HttpDelete("DeletePatientAttachment/{id}")]
        public async Task<IActionResult> DeletePatientAttachment(int id)
        {
            var res = await _ClinicalRepo.DeleteAttachment(id);
            return Ok(res);
        }
        [Authorize]
        [HttpGet("GetAttachmentsList/{patId}")]
        public async Task<IActionResult> GetAttachmentsList(int patId)
        {
            var res = await _ClinicalRepo.GetAttachments(patId);
            return Ok(res);
        }
        [Authorize]
        [HttpPost("SaveMedicalCertificateDetails")]
        public async Task<IActionResult> SaveMedicalCertificateDetails(PatientMedicalCertificate_CM model)
        {
            var res = await _ClinicalRepo.SaveMedicalCertificate(model);
            return Ok(res);
        }
        [Authorize]
        [HttpGet("GetMedicalCertificateDates/{patId}")]
        public async Task<IActionResult> GetMedicalCertificateDates(int patId)
        {
            var res = await _ClinicalRepo.GetMedicalCertificateDates(patId);
            return Ok(res);
        }
        [Authorize]
        [HttpGet("GetMedicalCertificateOldData{patId}/{date}")]
        public async Task<IActionResult> GetMedicalCertificateOldData(int patId, DateTime date)
        {
            var res = await _ClinicalRepo.GetMedicalCertificateByDate(patId, date);
            return Ok(res);
        }
    }
}
