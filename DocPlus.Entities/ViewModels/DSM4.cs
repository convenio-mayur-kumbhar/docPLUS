namespace DocPlus.Entities.ViewModels
{
    public partial class DSM4_VM : Base_VM
    {
        public int? DSM4_ID { get; set; }
        public string? DSM4_CODE { get; set; }
        public string? DSM4_REMARKS { get; set; }
        public bool? AFLAG { get; set; }
        public int? LAST_UPDATED_BY { get; set; }
        public string? LAST_UPDATED_ON { get; set; }
    }
}
