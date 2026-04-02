namespace DocPlus.Entities.ViewModels
{
    public partial class Appointment_VM : Base_VM
    {
        public int? APPT_ID { get; set; }
        public int? PAT_ID { get; set; }
        public DateTime? APPT_DATE { get; set; }
        public string? PAT_FULLNAME { get; set; }
        public string? PAT_TELENO { get; set; }
        public string? PAT_MOBNO { get; set; }
        public string? APPT_TIME { get; set; }
        public string? APPT_COMMENTS { get; set; }
        public bool? AFLAG { get; set; }
        public bool? VFLAG { get; set; }
        public bool? CFLAG { get; set; }
        public int? LAST_UPDATED_BY { get; set; }
        public DateTime? LAST_UPDATED_ON { get; set; }
    }

    public class Patient_DropDown
    {
        public int? PAT_ID { get; set; }
        public string? PAT_FULLNAME { get; set; }
    }

}
