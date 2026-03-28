using System.ComponentModel.DataAnnotations;

namespace DocPlus.Entities.ViewModels
{
    public partial class Login_VM
    {
        [Required(ErrorMessage = "Username is required")]
        public string? UserName { get; set; }
        [Required(ErrorMessage = "Password is required")]
        public string? Password { get; set; }
        public bool RememberMe { get; set; }
        public string? IPAddress { get; set; }
        public string? CaptchaCode { get; set; }
    }
    public partial class ResetPassword_VM
    {
        public int? EndUserID { get; set; }

        public int? EmployeeID { get; set; }

        public int? RememberMe { get; set; }

        public string? Email { get; set; }

        public string? LoginID { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string? Password { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string? NewPassword { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string? ConfirmNewPassword { get; set; }
    }
    public partial class LoginDetails_VM
    {
        public int EndUserID { get; set; }
        public string? UserName { get; set; }
    }
    public partial class ChangePassword_VM
    {
        public int? EndUserID { get; set; }

        public int? EmployeeID { get; set; }

        public int? RememberMe { get; set; }

        public string? Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string? NewPassword { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string? ConfirmNewPassword { get; set; }
    }

    public partial class EndUserLogin_VM
    {
        public List<UserEmployee_VM>? ObjUser { get; set; }
        public List<MenuScreen_VM>? ObjMenu { get; set; }
        public List<ScreenAction_VM>? ObjAction { get; set; }
    }

    public class RefreshTokenModel
    {
        public int EndUserId { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
    public class RefreshTokenRequest
    {
        public string? RefreshToken { get; set; }
    }

    public class ApiResponse<T>
    {
        public string? Status { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
    }

    public class LoginResponseData
    {
        public string? Token { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime AccessTokenExpiry { get; set; }
        public EndUserLogin_VM? User { get; set; }
    }
}
