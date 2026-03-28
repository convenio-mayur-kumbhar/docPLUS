namespace DocPlus.Entities.ViewModels
{
    public partial class Patient_VM : Base_VM
    {
        public int PatientID { get; set; }
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

    }

}
