using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DocPlus.Entities.ViewModels
{
    public partial class Profession_VM : Base_VM
    {
        public int? PROFESSION_ID { get; set; }
        public string? PROFESSION_NAME { get; set; }
        public bool? AFLAG { get; set; }
        public int? LAST_UPDATED_BY { get; set; }
        public string? LAST_UPDATED_ON { get; set; }
    }
}
