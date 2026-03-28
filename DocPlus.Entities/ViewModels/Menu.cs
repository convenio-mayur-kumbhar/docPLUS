using System.ComponentModel.DataAnnotations;

namespace DocPlus.Entities.ViewModels
{
    public class Menu_VM : Base_VM
    {
        [Key]
        public string MenuCode { get; set; }
        public string MenuName { get; set; }
        public byte Sequence { get; set; }
        public string ParentMenuCode { get; set; }
        public string ModuleCode { get; set; }
        public short? UserRoleID { get; set; }
        public string Text { get { return MenuName; } }
        public string Value { get { return MenuCode; } }
    }

    public class MenuScreen_VM
    {
        public string ObjectName { get; set; }
        public bool IsObjectMenu { get; set; }
        public short Sequence { get; set; }//why this is short it should be byte
        public string MenuCode { get; set; }
        public short? ScreenID { get; set; }
        public bool? HasInsert { get; set; }
        public bool? HasUpdate { get; set; }
        public bool? HasDelete { get; set; }
        public bool? HasSelect { get; set; }
        public bool? HasImport { get; set; }
        public bool? HasExport { get; set; }
        public string EncryptScreenID { get; set; }
    }

    public class Accesspermission_Wrapper
    {
        
        public bool Status { get; set; }
        public List<MenuScreen_VM> MenuList = new List<MenuScreen_VM>();
        public List<ScreenAction_VM> ScreenActionList = new List<ScreenAction_VM>();
    }

    public enum EnumScreenAccess
    {
        HasInsert = 1,
        HasUpdate = 2,
        HasDelete = 3,
        HasSelect = 4,
        HasImport = 5,
        HasExport = 6
    };
}
