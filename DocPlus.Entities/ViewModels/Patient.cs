namespace DocPlus.Entities.ViewModels
{
    public partial class Patient_VM : Base_VM
    {
        public int? PatientID { get; set; }
        public int? AppointmentID { get; set; }
        public DateTime? AppointmentDate { get; set; }
        public string AppointmentDateCustom { get { return AppointmentDate == null ? string.Empty : DateFormat(AppointmentDate); } }
        public TimeSpan? AppointmentTime { get; set; }
        public string AppointmentTimeCustom { get { return AppointmentTime == null ? string.Empty : TimeFormat(AppointmentTime); } }        
        public string? AppointmentComments { get; set; }
        public string? RegNo { get; set; }
        public string? FullName { get; set; }
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string? Address { get; set; }
        public DateTime? DOB { get; set; }       
        public string DOBCustom { get { return DOB == null ? string.Empty : DateFormat(DOB); } }
        public string? Gender { get; set; }
        public string? TelePhoneNo { get; set; }
        public string? MobileNo { get; set; }
        public string? EmailID { get; set; }
        public string? Doctor { get; set; }
        public int? CategoryID { get; set; }
        public string? CategoryName { get; set; }
        public int? StatusID { get; set; }
        public string? StatusName { get; set; }
        public int? OccupationID { get; set; }
        public string? OccupationName { get; set; }
        public int? MarritialStatusID { get; set; }
        public string? MarritialStatusName { get; set; }
        public string? Remarks { get; set; }
        public int? LastUpdatedBy { get; set; }
        public DateTime? LastUpdatedOn { get; set; }
        public bool? AFlag { get; set; }
        public string? AFlagName { get; set; }
        public List<PatientNOKDetails>? NOKList { get; set; }
        public List<PatientOPDetails>? OPList { get; set; }
    }
    public class PatientNOKDetails
    {
        public int? NOK_ID { get; set; }
        public int? PAT_ID { get; set; }
        public string? NOK_NAME { get; set; }
        public string? NOK_RELATION { get; set; }
        public string? NOK_ADDR { get; set; }
        public string? NOK_TELENO { get; set; }
        public string? NOK_MOBNO { get; set; }
        public string? NOK_EMAIL { get; set; }
        public string? NOK_REMARKS { get; set; }
        public int? AFLAG { get; set; }
        public int? LAST_UPDATED_BY { get; set; }
        public DateTime? LAST_UPDATED_ON { get; set; }
    }

    public class PatientOPDetails
    {
        public int? OP_ID { get; set; }
        public int? PAT_ID { get; set; }
        public string? OP_NAME { get; set; }
        public string? PROFESSION_NAME { get; set; }
        public string? OP_ADDR { get; set; }
        public string? OP_TELENO { get; set; }
        public string? OP_MOBNO { get; set; }
        public string? OP_EMAIL { get; set; }
        public string? OP_REMARKS { get; set; }
        public int? AFLAG { get; set; }
        public int? LAST_UPDATED_BY { get; set; }
        public DateTime? LAST_UPDATED_ON { get; set; }
    }
    public class MasterDropDown : Base_VM
    {
        public int Value { get; set; }
        public string? Text { get; set; }
    }   

}
