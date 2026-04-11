namespace DocPlus.Entities.ViewModels
{
    public partial class Occupation_VM : Base_VM
    {
        public int? OCCUPATION_ID { get; set; }
        public string? OCCUPATION_NAME { get; set; }
        public bool? AFLAG { get; set; }
        public int? LAST_UPDATED_BY { get; set; }
        public string? LAST_UPDATED_ON { get; set; }
    }
}
