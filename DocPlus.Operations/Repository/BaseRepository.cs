using DocPlus.Entities.Utility;
using DocPlus.Entities.ViewModels;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Globalization;

namespace DocPlus.Operations.Repository
{
    public abstract class BaseRepository
    {
        public static readonly log4net.ILog logger = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public BaseRepository(IConfiguration configuration)
        {
            Configuration = configuration;
        }
        public string ConnectionString { get { return Configuration.GetConnectionString("ConnectionString"); } }

        public IConfiguration Configuration { get; }

        public string GetDateFormat(DateTime? date, string format)
        {
            string formattedDate = string.Empty;
            try
            {
                formattedDate = (Convert.ToDateTime(date)).ToString(format, CultureInfo.InvariantCulture);
            }
            catch { }
            return formattedDate;
        }
        public string GetDateToSystem(DateTime date)
        {
            var day = date.Day;
            var month = date.Month;
            var year = date.Year;
            return year + "-" + month + "-" + day;
        }
        public static object GetDBNULL(object Value)
        {
            if (Value == null) Value = DBNull.Value;
            return Value;
        }
        public static object GetDBNULLString(object Value)
        {
            if (Value == null || ((string)Value) == "") return Value = DBNull.Value;
            return Value;
        }

        public static object GetNULLString(object Value)
        {
            if (Value == null || ((string)Value) == "" || ((string)Value) == "null") return Value = DBNull.Value;
            return Value;
        }

        public static object GetDBNULL(object Value, bool IsInteger)
        {
            if (Value == null) return Value = DBNull.Value;
            try
            {
                if (IsInteger) if (Convert.ToInt32(Value) == 0) Value = DBNull.Value;
            }
            catch (Exception)
            {
            }
            return Value;
        }

        public DataTable ConvertToDatatable<T>(List<T> data)
        {
            return Common.ConvertToDatatable<T>(data);
        }

        public static List<T> ConvertToList<T>(DataTable dt)
        {
            return Common.ConvertToList<T>(dt);
        }

        public static T ConvertTo<T>(DataTable dt)
        {
            List<T> NewList = Common.ConvertToList<T>(dt);
            if (NewList.Count > 0)
                return NewList[0];
            else return default;
        }
    }
    public class MenuConversion
    {
        public List<MenuScreen_VM> GetUserRoleMenu(List<MenuScreen_VM> ModelList)
        {
            List<MenuScreen_VM> menuList = new List<MenuScreen_VM>();

            menuList = (from MenuScreen_VM Model in ModelList
                        select new MenuScreen_VM()
                        {
                            ObjectName = Model.ObjectName,
                            IsObjectMenu = Model.IsObjectMenu,
                            Sequence = Model.Sequence,
                            MenuCode = Model.MenuCode,
                            ScreenID = Model.ScreenID,
                            HasInsert = Model.HasInsert,
                            HasUpdate = Model.HasUpdate,
                            HasDelete = Model.HasDelete,
                            HasSelect = Model.HasSelect,
                            HasImport = Model.HasImport,
                            HasExport = Model.HasExport,
                            EncryptScreenID = Security.Encrypt(Model.ScreenID.ToString())
                        }).OrderBy(x => x.Sequence).ToList();

            return menuList;
        }

        public List<ScreenAction_VM> GetUserRoleScreenAction(List<ScreenAction_VM> ModelList)
        {
            var ScreenActionList = new List<ScreenAction_VM>();

            ScreenActionList = (from ScreenAction_VM Model in ModelList
                                select new ScreenAction_VM()
                                {
                                    ScreenID = Model.ScreenID,
                                    ActionCode = Model.ActionCode,
                                    ActionName = Model.ActionName,
                                    Sequence = Model.Sequence,
                                    IsAudited = Model.IsAudited,
                                    IsRendered = Model.IsRendered,
                                }).OrderBy(x => x.Sequence).ToList();

            return ScreenActionList;
        }
    }
};