using System.ComponentModel.DataAnnotations;

namespace DocPlus.Entities.ViewModels
{
    public class EndUser_VM : Base_VM
    {
        [Key]
        public int? EndUserID { get; set; }
        [MaxLength(50)]
        public string LoginID { get; set; }
        [MaxLength(30)]
        public string FirstName { get; set; }
        [MaxLength(30)]
        public string MiddleName { get; set; }
        [MaxLength(30)]
        public string LastName { get; set; }
        [MaxLength(10)]
        public string Gender { get; set; }
        [MaxLength(50)]
        public string EmailID { get; set; }
        public DateTime? ActivatedDTM { get; set; }

        [MaxLength(16)]
        public string UserIdentity { get; set; }
        [MaxLength(25)]
        public string LastAccessPoint { get; set; }
        public DateTime? LastLoginDTM { get; set; }
        [MaxLength(100)]
        public string SecretQuestion { get; set; }
        [MaxLength(100)]
        public string SecretAnswer { get; set; }
        public int? ResetPasswordURLID { get; set; }
        [MaxLength(2)]
        public string LanguageCode { get; set; }
        public decimal? UTCOffset { get; set; }
        [MaxLength(2)]
        public string DefaultModuleCode { get; set; }
        public short? UserRoleID { get; set; }
        public string UserRoleName { get; set; }
        public int? ActivationURLID { get; set; }
        public string Text { get { return FirstName + " " + LastName; } }
        public string Value { get { return EndUserID.ToString(); } }
        public string Name { get; set; }
        public short? DesignationID { get; set; }
        public short? DepartmentID { get; set; }
        public string DesignationName { get; set; }
        public string DepartmentName { get; set; }
        public List<UserRoleUser_VM> UserRoleUserList { get; set; }
        //Not to make nullable
        public bool IsCustomerUser { get; set; }
        public DateTime? EffectiveFromDate { get; set; }
        public string EffectiveFromDateCustom
        { get { return EffectiveFromDate == null ? string.Empty : DateFormat(EffectiveFromDate); } }
        public DateTime? EffectiveTillDate { get; set; }
        public string EffectiveTillDateCustom
        { get { return EffectiveTillDate == null ? string.Empty : DateFormat(EffectiveTillDate); } }

        public bool IsDeactivated
        {
            get
            {
                if (EffectiveTillDate < DateTime.Now)
                    return true;
                else return false;
            }
        }
    }

    public class UserEmployee_VM
    {
        public int EndUserID { get; set; }
        public short UserRoleID { get; set; }
        public string UserName { get; set; }
        public decimal? UTCOffset { get; set; }
        public bool IsCustomerUser { get; set; }
        public string Token { get; set; }
        public string Message { get; set; }
        public int CustomerID { get; set; }
        public string CustomerName { get; set; }
    }

    public class UserRoleUser_VM
    {
        [Key]

        public short? UserRoleID { get; set; }

        [Key]

        public int? EndUserID { get; set; }
    }

    public class UserRoleUser_TableType_VM
    {
        [Key]

        public short? UserRoleID { get; set; }
    }

    public class MailEndUser_VM
    {
        public int? EndUserID { get; set; }

        [MaxLength(50)]
        public string LoginID { get; set; }

        [MaxLength(30)]
        public string FirstName { get; set; }

        [MaxLength(30)]
        public string MiddleName { get; set; }

        [MaxLength(30)]
        public string LastName { get; set; }

        [MaxLength(2)]
        public string LanguageCode { get; set; }

        public decimal? UTCOffset { get; set; }

        [MaxLength(2)]
        public string DefaultModuleCode { get; set; }

        [MaxLength(10)]
        public string Gender { get; set; }

        [MaxLength(50)]
        public string EmailID { get; set; }

        //[MaxLength(16)]
        //public string UserIdentity { get; set; }
        public DateTime? ActivatedDTM { get; set; }

        [MaxLength(25)]
        public string LastAccessPoint { get; set; }
        public DateTime? LastLoginDTM { get; set; }

        [MaxLength(100)]
        public string SecretQuestion { get; set; }

        [MaxLength(100)]
        public string SecretAnswer { get; set; }
        public int? ActivationURLID { get; set; }
        public int? ResetPasswordURLID { get; set; }

        public string Text { get { return FirstName + " " + LastName; } }
        public string Value { get { return EndUserID.ToString(); } }
        public string Name { get; set; }
    }

    public class UserBuildingMapping_VM
    {
        public int? UserID { get; set; }
        public List<BuildingCode_VM> Building_TableTypeList { get; set; }

        public string IsAddOrUpdate { get; set; }
    }

    public class BuildingCode_VM
    {
        public string BuildingCode { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public class CustomerUserEmployee_VM : Base_VM
    {
        public int CustomerID { get; set; }
        public string CustomerName { get; set; }
        public string UserName { get; set; }
        public Boolean IsCustomerUser { get; set; }

    }
};