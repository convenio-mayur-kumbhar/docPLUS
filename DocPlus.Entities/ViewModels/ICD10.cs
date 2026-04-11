namespace DocPlus.Entities.ViewModels
{
    public partial class ICD10_VM : Base_VM
    {
        public int? ICD10_ID { get; set; }
        public string? ICD10_CODE { get; set; }
        public string? ICD10_REMARKS { get; set; }
        public bool? AFLAG { get; set; }
        public int? LAST_UPDATED_BY { get; set; }
        public string? LAST_UPDATED_ON { get; set; }
    }
}
