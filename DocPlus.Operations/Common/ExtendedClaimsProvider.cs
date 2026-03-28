using DocPlus.Entities.ViewModels;
using Newtonsoft.Json;
using System.Collections;
using System.Security.Claims;

namespace DocPlus.Services.Common
{
    public static class ExtendedClaimsProvider
    {
        public static IEnumerable<Claim> GetClaims(UserEmployee_VM user, List<MenuScreen_VM> screen)
        {
            //string p= String.Join(",", screen.ToArray())

            List<Hashtable> ScreenPermission = new List<Hashtable>();

            foreach (var item in screen)
            {
                var hasPermission = new Hashtable()
                {
                    ["ScreenName"] = item.ObjectName,
                    ["ScreenID"] = item.ScreenID,
                    ["HasInsert"] = item.HasInsert,
                    ["HasUpdate"] = item.HasUpdate,
                    ["HasDelete"] = item.HasDelete,
                    ["HasSelect"] = item.HasSelect,
                    ["HasImport"] = item.HasImport,
                    ["HasExport"] = item.HasExport
                };
                ScreenPermission.Add(hasPermission);
            }

            var PermissionCode = JsonConvert.SerializeObject(ScreenPermission);


            List<Claim> claims = new List<Claim>
            {
                CreateClaim("UserLoginId", Convert.ToString(user.EndUserID)),
                CreateClaim("UserRole", Convert.ToString(user.UserRoleID)),
                CreateClaim("PermissionCode", Convert.ToString(PermissionCode))
            };
            return claims;
        }

        public static Claim CreateClaim(string type, string value)
        {
            return new Claim(type, value, ClaimValueTypes.String);
        }
    }
}
