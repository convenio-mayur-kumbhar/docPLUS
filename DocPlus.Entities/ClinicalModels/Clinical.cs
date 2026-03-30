using DocPlus.Entities.ViewModels;

namespace DocPlus.Entities.ClinicalModels
{
    public class ClinicalDetails_CM
    {
        public Patient_VM? Patient { get; set; }
        public List<NOK_CM>? NOKDetails { get; set; }
        public List<OP_CM>? OPDetails { get; set; }
        public InitialAssessment_CM? InitialDetails { get; set; }
    }
    public class NOK_CM
    {
        public int NOK_ID { get; set; }
        public int PAT_ID { get; set; }
        public string? NOK_NAME { get; set; }
        public string? NOK_RELATION { get; set; }
        public string? NOK_TELENO { get; set; }
        public string? NOK_ADDR { get; set; }
        public string? NOK_EMAIL { get; set; }
        public string? NOK_REMARKS { get; set; }
        public string? NOK_MOBNO { get; set; }
    }
    public class OP_CM
    {
        public int OP_ID { get; set; }
        public string? OP_NAME { get; set; }
        public string? PROFESSION_NAME { get; set; }
        public string? OP_MOBNO { get; set; }
        public string? OP_ADDR { get; set; }
        public string? OP_TELENO { get; set; }
        public string? OP_EMAIL { get; set; }
        public string? OP_REMARKS { get; set; }
    }
    public class InitialAssessment_CM
    {
        public int PAT_ID { get; set; }
        public string? ASS_PC { get; set; }
        public string? ASS_HPC { get; set; }
        public string? ASS_PPH { get; set; }
        public string? ASS_MH { get; set; }
        public string? ASS_FH { get; set; }
        public string? ASS_PH { get; set; }
        public string? ASS_DAH { get; set; }
        public string? ASS_FRH { get; set; }
        public string? ASS_PMP { get; set; }
        public string? ASS_MSE { get; set; }
    }
    public class MasterDropdownDto
    {
        public int ID { get; set; }
        public string? DisplayText { get; set; }
    }
    public class PatientInitialDetails_CM
    {
        public int PAT_ID { get; set; }
        public string? ASS_PC { get; set; }
        public string? ASS_HPC { get; set; }
        public string? ASS_PPH { get; set; }
        public string? ASS_MH { get; set; }
        public string? ASS_FH { get; set; }
        public string? ASS_PH { get; set; }
        public string? ASS_DAH { get; set; }
        public string? ASS_FRH { get; set; }
        public string? ASS_PMP { get; set; }
        public string? ASS_MSE { get; set; }
        public int LAST_UPDATED_BY { get; set; }
    }
    public class PatientAssessmentDetails
    {
        public int PAT_ASS_ID { get; set; }
        public int PAT_ID { get; set; }
        public int? APPT_ID { get; set; }
        public DateTime? ASS_DATE { get; set; }
        public string? ASS_FIELD { get; set; }
        public string? ASS_VALUE { get; set; }
        public string? AFLAG { get; set; }
        public int? LAST_UPDATED_BY { get; set; }
        public DateTime? LAST_UPDATED_ON { get; set; }
    }
    public class PatientICD10_CM
    {
        public int PAT_ID { get; set; }
        public DateTime? ASS_DATE { get; set; }
        public List<ICD10_IDS_List>? ICD10_List { get; set; }
        public string? AFLAG { get; set; }
        public int? LAST_UPDATED_BY { get; set; }
        public DateTime? LAST_UPDATED_ON { get; set; }
    }
    public class ICD10_IDS_List
    {
        public int ICD10_ID { get; set; }
    }
    public class PatientDSM4_CM
    {
        public int PAT_ID { get; set; }
        public DateTime? ASS_DATE { get; set; }
        public List<DSM4_List>? DSM4_List { get; set; }
        public string? AFLAG { get; set; }
        public int? LAST_UPDATED_BY { get; set; }
        public DateTime? LAST_UPDATED_ON { get; set; }
    }
    public class DSM4_List
    {
        public int DSM4_ID { get; set; }
        public string? DSM4_REMARKS { get; set; }
    }
    public class RiskGroup_CM
    {
        public string? RISK_TYPE { get; set; }
        public List<RiskDetail_CM> Details { get; set; } = new();
    }
    public class RiskDetail_CM
    {
        public int RISK_ID { get; set; }
        public string? RISK_DETAILS { get; set; }
        public string? RISK_FLAG { get; set; } 
    }
    public class PatientRiskSave_CM
    {
        public int PAT_ID { get; set; }
        public DateTime? ASS_DATE { get; set; }
        public int LAST_UPDATED_BY { get; set; }
        public List<RiskItem>? Risk_List { get; set; }
    }
    public class RiskItem
    {
        public int RISK_ID { get; set; }
        public string? RISK_FLAG { get; set; } // Y / N / D
    }
    public class PatientPrescription_CM
    {
        public int PAT_ID { get; set; }
        public DateTime? ASS_DATE { get; set; }
        public int LAST_UPDATED_BY { get; set; }
        public List<PrescriptionItem>? Prescription_List { get; set; }
    }
    public class PrescriptionItem
    {
        public string? TR_FORMULATION { get; set; }
        public string? TR_MEDICINE { get; set; }
        public string? TR_DOSAGE { get; set; }
        public string? TR_ROUTE { get; set; }
        public string? TR_FREQ { get; set; }
        public string? TR_OTHERS { get; set; }
    }
    public class PatientInpatient_CM
    {
        public int PAT_INPATIENT_ID { get; set; }
        public int PAT_ID { get; set; }
        public DateTime? INPT_ADM_DATE { get; set; }
        public DateTime? INPT_DISCH_DATE { get; set; }
        public string? INPT_DIAGNOSIS { get; set; }
        public string? INPT_NOTES { get; set; }
        public int? LAST_UPDATED_BY { get; set; }
    }
   
    public class PatientAttachment_CM
    {
        public int ASS_ATTACH_ID { get; set; }
        public int PAT_ID { get; set; }
        public long FileID { get; set; }
        public string? DOC_NAME { get; set; }
        public string? DOC_DESC { get; set; }
        public string? FileName { get; set; }
        public string? FileType { get; set; }
        public long FileSize { get; set; }
        public int? LAST_UPDATED_BY { get; set; }
        public List<AttachmentItem>? AttachmentList { get; set; }
    }
    public class AttachmentItem
    {
        public int AttachmentSequence { get; set; }
        public string? FileName { get; set; }
        public string? FileType { get; set; }   // pdf, jpg
        public long FileSize { get; set; }
        public string? Remarks { get; set; }
        public string? LocalFilePath { get; set; } // 🔥 IMPORTANT (for saving file)
    }
    public class PatientMedicalCertificate_CM
    {
        public int PAT_ID { get; set; }
        public DateTime? MC_DATE { get; set; }
        public DateTime? MC_ASS_FROM_DT { get; set; }
        public DateTime? MC_ASS_DT { get; set; }
        public string? MC_SUFF_FROM { get; set; }
        public string? MC_CONSEQUENCES { get; set; }
        public string? MC_RECO { get; set; }
        public int LAST_UPDATED_BY { get; set; }
    }
}
