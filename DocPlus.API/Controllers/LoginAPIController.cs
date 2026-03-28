using DocPlus.Entities.ViewModels;
using DocPlus.Operations.Repository;
using DocPlus.Utilities.APIHelperUtility;
using Microsoft.AspNetCore.Mvc;

namespace DocPlus.WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginAPIController : BaseAPIController
    {
        private readonly ILoginRepository _loginRepo;
        private readonly TokenService _tokenService;
        public LoginAPIController(ILoginRepository loginRepo, TokenService tokenService)
        {
            _loginRepo = loginRepo;
            _tokenService = tokenService;
        }
        // POST: api/Login
        [HttpPost]
        public IActionResult Post(Login_VM model)
        {
            if (!ModelState.IsValid)
                return ApiError.ModelStateErrorResponse(ModelState);

            try
            {
                var response = _loginRepo.GetLogin(model);

                if (response == null || response.ObjUser == null || response.ObjUser.Count == 0)
                {
                    return Unauthorized(new JsonResponse("0", "Invalid Username or Password", null!));
                }

                var user = response.ObjUser.First();

                // Generate Tokens
                var accessToken = _tokenService.GenerateAccessToken(user.UserName, user.EndUserID);
                var refreshToken = _tokenService.GenerateRefreshToken();

                // Save Refresh Token
                var refModel = new RefreshTokenModel
                {
                    EndUserId = user.EndUserID,
                    RefreshToken = refreshToken,
                    ExpiryDate = DateTime.UtcNow.AddDays(7)
                };

                _loginRepo.SaveRefreshToken(refModel);

                // Response
                var result = new LoginResponseData
                {
                    Token = accessToken,
                    RefreshToken = refreshToken,
                    AccessTokenExpiry = DateTime.UtcNow.AddMinutes(30),
                    User = response
                };

                return Ok(new JsonResponse("1", "Login Success", result));
            }
            catch (Exception ex)
            {
                return BadRequest(new JsonResponse("0", ex.Message, null!));
            }
        }
        [HttpPost("UserCustomer")]
        public IActionResult UserCustomer(CustomerUserEmployee_VM model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    EndUserLogin_VM Response = new EndUserLogin_VM();
                    Response = _loginRepo.GetUserCustomer(model);
                    return Ok(Response);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex);
                }
            }

            else { return ApiError.ModelStateErrorResponse(ModelState); }
        }
        [HttpPost("refresh-token")]
        public IActionResult RefreshToken(string refreshToken)
        {
            RefreshTokenModel model = new RefreshTokenModel();
            model.RefreshToken = refreshToken;
            var dt = _loginRepo.GetRefreshToken(model);
            if (dt.Rows.Count == 0)
                return Unauthorized(new JsonResponse("0", "Invalid Token", null!));
            var row = dt.Rows[0];
            if (Convert.ToDateTime(row["ExpiryDate"]) < DateTime.Now)
                return Unauthorized(new JsonResponse("0", "Token Expired", null!));
            int userId = Convert.ToInt32(row["EndUserId"]);
            var newToken = _tokenService.GenerateAccessToken("User", userId);
            return Ok(new JsonResponse("1", "Token Refreshed", new
            {
                Token = newToken
            }));
        }
        [HttpPost("logout")]
        public IActionResult Logout(RefreshTokenRequest request)
        {
            if (string.IsNullOrEmpty(request.RefreshToken))
                return BadRequest(new JsonResponse("0", "Invalid Token", null!));

            _loginRepo.RevokeRefreshToken(request);

            return Ok(new JsonResponse("1", "Logout Success", null!));
        }
    }
}
