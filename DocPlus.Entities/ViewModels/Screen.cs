using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

namespace DocPlus.Entities.ViewModels
{
    public class Screen_VM : Base_VM
    {
        [Key]
        public short? ScreenID { get; set; }
        //[Required(ErrorMessageResourceName = "Screen Name Required")]
        public string ScreenName { get; set; }
        public string MenuCode { get; set; }
        public string MenuName { get; set; }
        //[Required(ErrorMessageResourceName = "Sequence Required")]
        public byte Sequence { get; set; }
        //[Required(ErrorMessageResourceName = "Insert Required")]
        public bool HasInsert { get; set; }
        //[Required(ErrorMessageResourceName = "Update Required")]
        public bool HasUpdate { get; set; }
        //[Required(ErrorMessageResourceName = "Delete Required")]
        public bool HasDelete { get; set; }
        //[Required(ErrorMessageResourceName = "Select Required")]
        public bool HasSelect { get; set; }
        //[Required(ErrorMessageResourceName = "Update Audit Required")]

        public bool HasImport { get; set; }

        public bool HasExport { get; set; }

        //[Required(ErrorMessageResourceName = "Update Audit Required")]
        public bool UpdateAudit { get; set; }
        //[Required(ErrorMessageResourceName = "Delete Audit Required")]
        public bool DeleteAudit { get; set; }
        public string ScreenTable { get; set; }
        public IList<ScreenTable_VM> ScreenTableList
        {
            get
            {
                if (ScreenTable != "" && ScreenTable != null)
                {
                    return (List<ScreenTable_VM>)JsonConvert.DeserializeObject(ScreenTable, (typeof(List<ScreenTable_VM>)));
                }

                else return null;
            }
        }
        public string ScreenAction { get; set; }
        public IList<ScreenAction_VM> ScreenActionList
        {
            get
            {
                if (ScreenAction != "" && ScreenAction != null)
                {
                    return (List<ScreenAction_VM>)JsonConvert.DeserializeObject(ScreenAction, (typeof(List<ScreenAction_VM>)));
                }

                else return null;
            }
        }
    }

    public class ScreenAccess_VM : Screen_VM
    {
        public short? UserRoleID { get; set; }

        public string AdditionalAccess { get; set; }

        private string EnableDisbled(bool? Has, bool? HasUserRole)
        {
            if (Has == true && HasUserRole == true)
                return "checked='checked'";
            else if (Has == true && HasUserRole == false)
                return "";
            else if (Has == false)
                return "disabled";
            else
                return "";
        }

        public string HasInsertCustom { get { return EnableDisbled(HasInsert, HasInsertUserRole); } }
        public string HasUpdateCustom { get { return EnableDisbled(HasUpdate, HasUpdateUserRole); } }
        public string HasDeleteCustom { get { return EnableDisbled(HasDelete, HasDeleteUserRole); } }
        public string HasSelectCustom { get { return EnableDisbled(HasSelect, HasSelectUserRole); } }
        public string HasImportCustom { get { return EnableDisbled(HasImport, HasImportUserRole); } }
        public string HasExportCustom { get { return EnableDisbled(HasExport, HasExportUserRole); } }
        public string UpdateAuditCustom
        {
            get
            {
                if (!HasInsert)
                    return "disabled";
                else if (HasInsert == true && HasInsertUserRole == true)
                    return "checked";
                else if (HasInsert == true && HasInsertUserRole == false)
                    return "";

                return "";
            }
        }
        public string DeleteAuditCustom
        {
            get
            {
                if (!HasInsert)
                    return "disabled";
                else if (HasInsert == true && HasInsertUserRole == true)
                    return "checked";
                else if (HasInsert == true && HasInsertUserRole == false)
                    return "";

                return "";
            }
        }

        public bool? HasInsertUserRole { get; set; }
        public bool? HasUpdateUserRole { get; set; }
        public bool? HasDeleteUserRole { get; set; }
        public bool? HasSelectUserRole { get; set; }
        public bool? HasImportUserRole { get; set; }
        public bool? HasExportUserRole { get; set; }
    }

    public class Table_VM
    {
        public string TableName { get; set; }
        public string Text { get { return TableName; } }
        public string Value { get { return TableName; } }
    }
    public class ScreenTable_VM
    {
        public int ScreenID { get; set; }
        public string TableName { get; set; }
        public bool IsSingleTuple { get; set; }
        public bool IsDetailFetched { get; set; }
    }
    public class ScreenAction_VM
    {
        public int ScreenID { get; set; }
        public string ActionCode { get; set; }
        public string ActionName { get; set; }
        public byte Sequence { get; set; }
        public bool IsAudited { get; set; }
        public bool IsRendered { get; set; }
    }
}
