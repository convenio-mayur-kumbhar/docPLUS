using DocPlus.Entities.Utility;
using DocPlus.Entities.ViewModels;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;
namespace DocPlus.Operations.Repository
{
    public class LoginRepository : BaseRepository, ILoginRepository
    {
        public LoginRepository(IConfiguration configuration) : base(configuration)
        { }
        public EndUserLogin_VM GetLogin(Login_VM model)
        {
            EndUserLogin_VM query = new EndUserLogin_VM();
            try
            {
                using (var db = new DBConnection(ConnectionString))
                {
                    var par = new SqlParameter[]
                    {
                        new SqlParameter("@p_LoginID", GetDBNULL(model.UserName ?? string.Empty)),
                        new SqlParameter("@p_UserIdentity", GetDBNULL(model.Password ?? string.Empty)),
                    };
                    var ds = db.ExecuteDataSet("UserLogin", par);
                    // ✅ Check dataset
                    if (ds != null && ds.Tables.Count > 0)
                    {
                        // ✅ USER TABLE
                        if (ds.Tables[0].Rows.Count > 0)
                        {
                            query.ObjUser = ConvertToList<UserEmployee_VM>(ds.Tables[0]);
                        }
                        // ✅ MENU TABLE
                        if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                        {
                            query.ObjMenu = ConvertToList<MenuScreen_VM>(ds.Tables[1]);
                        }
                        // ✅ ACTION TABLE
                        if (ds.Tables.Count > 2 && ds.Tables[2].Rows.Count > 0)
                        {
                            query.ObjAction = ConvertToList<ScreenAction_VM>(ds.Tables[2]);
                        }
                        // ✅ LOGIN SUCCESS CHECK
                        if (query.ObjUser != null && query.ObjUser.Count > 0)
                        {
                            return query;
                        }
                    }
                    // ❌ LOGIN FAILED
                    return new EndUserLogin_VM
                    {
                        ObjUser = new List<UserEmployee_VM> { new UserEmployee_VM { Message = "Invalid Username or Password" } }
                    };
                }
            }
            catch (Exception ex)
            {
                logger.Error("LoginRepository_GetLogin Error: ", ex);
                return new EndUserLogin_VM { ObjUser = new List<UserEmployee_VM> { new UserEmployee_VM { Message = "Internal Server Error" } } };
            }
        }
        public EndUserLogin_VM GetUserCustomer(CustomerUserEmployee_VM Model)
        {
            EndUserLogin_VM query = new EndUserLogin_VM();
            try
            {
                using (var db = new DBConnection(ConnectionString))
                {
                    var ds = new DataSet();
                    var par = new SqlParameter[]
                    {
                      new SqlParameter("@pUserRoleID", GetDBNULL(Model.CurrentUserRoleID)),
                      //new SqlParameter("@p_CustomerID", GetDBNULL(Model.CustomerID)),
                    };

                    ds = db.ExecuteDataSet("GetMenuAndScreenData", par);


                    query.ObjMenu = ConvertToList<MenuScreen_VM>(ds.Tables[0]);
                    if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                        query.ObjAction = ConvertToList<ScreenAction_VM>(ds.Tables[1]);
                }
            }
            catch (Exception ex)
            {
                logger.Error("LoginRepository_GetUserCustomer Error: ", ex);
            }

            return query;
        }
        public void SaveRefreshToken(RefreshTokenModel model)
        {
            try
            {
                using (var db = new DBConnection(ConnectionString))
                {
                    var par = new SqlParameter[]
                    {
                        new SqlParameter("@UserId", model.EndUserId),
                        new SqlParameter("@RefreshToken", model.RefreshToken),
                        new SqlParameter("@ExpiryDate", DateTime.Now.AddDays(7))
                    };
                    db.ExecuteDataSet("InsertRefreshToken", par);
                }
            }
            catch (Exception ex)
            {
                logger.Error("SaveRefreshToken Error: ", ex);
                throw;
            }
        }
        public DataTable GetRefreshToken(RefreshTokenModel Model)
        {
            using (var db = new DBConnection(ConnectionString))
            {
                var par = new SqlParameter[] { new SqlParameter("@RefreshToken", Model.RefreshToken) };
                var ds = db.ExecuteDataSet("GetRefreshToken", par);
                return ds.Tables[0];
            }
        }
        public void RevokeRefreshToken(RefreshTokenRequest model)
        {
            try
            {
                using (var db = new DBConnection(ConnectionString))
                {
                    var par = new SqlParameter[] { new SqlParameter("@RefreshToken", model.RefreshToken) };
                    db.ExecuteDataSet("RevokeRefreshToken", par);
                }
            }
            catch (Exception ex)
            {
                logger.Error("RevokeRefreshToken Error: ", ex);
                throw;
            }
        }
    }
    public interface ILoginRepository
    {
        public EndUserLogin_VM GetLogin(Login_VM Model);
        public EndUserLogin_VM GetUserCustomer(CustomerUserEmployee_VM Model);
        public void SaveRefreshToken(RefreshTokenModel Model);
        public DataTable GetRefreshToken(RefreshTokenModel Model);
        public void RevokeRefreshToken(RefreshTokenRequest model);
    }
}
