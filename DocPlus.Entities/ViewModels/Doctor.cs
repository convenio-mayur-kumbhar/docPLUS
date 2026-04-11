namespace DocPlus.Entities.ViewModels
{
    public partial class Doctor_VM : Base_VM
    {
        public int? DOC_ID { get; set; }
        public string? DOC_SCODE { get; set; }
        public string? DOC_NAME { get; set; }
        public string? DOC_ADDR { get; set; }
        public string? DOC_TELENO { get; set; }
        public string? DOC_MOBNO { get; set; }
        public string? DOC_EMAIL { get; set; }
        public string? DOC_REMARKS { get; set; }
        public int? AFLAG { get; set; }
        public int? LAST_UPDATED_BY { get; set; }
        public DateTime? LAST_UPDATED_ON { get; set; }
    }
}
