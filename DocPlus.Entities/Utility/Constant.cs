namespace DocPlus.Entities.Utility
{
    public static class ModuleCode
    {
        /// <summary>
        /// Base Module
        /// </summary>
        public const string Base = "BS";

        /// <summary>
        /// Safety Module
        /// </summary>
        /// 
        public const string Safety = "SF";

        /// <summary>
        /// Drill Module
        /// </summary>
        /// 
        public const string Drill = "DR";

        /// <summary>
        /// Incident Module
        /// </summary>
        /// 
        public const string Incident = "IN";

        /// <summary>
        /// Training Module
        /// </summary>
        /// 
        public const string Training = "TR";

        /// <summary>
        /// FRAS Module
        /// </summary>
        /// 
        public const string FRAS = "FR";

        /// <summary>
        /// Hira Module
        /// </summary>
        ///  
        public const string HIRA = "HR";

        /// <summary>
        /// Work Module
        /// </summary>
        /// 
        public const string Work = "WO";/*Hot Work*/

        /// <summary>
        /// Fleet Module
        /// </summary>
        public const string Fleet = "FM";/*Hot Work*/

        /// <summary>
        /// Compliance Module
        /// </summary>
        public const string Compliance = "CM";/*Hot Work*/

        /// <summary>
        /// Audit Module
        /// </summary>
        public const string Audit = "AU";/*Hot Work*/

        /// <summary>
        /// Asset Management Module
        /// </summary>
        public const string Asset = "AM";

        /// <summary>
        /// Asset Management Module
        /// </summary>
        public const string CustomerPortal = "CP";

        public static string GetAreaName(string ModelCode)
        {

            var LayoutUrl = "";

            switch (ModelCode)
            {
                //case Base:
                //    LayoutUrl = "~/Views/Shared/_Layout_BS.cshtml";
                //    break;
                case Safety:
                    LayoutUrl = "~/Areas/Safety/Views/Shared/_Layout.cshtml";
                    break;
                case Drill:
                    LayoutUrl = "~/Areas/Drill/Views/Shared/_Layout.cshtml";
                    break;
                case FRAS:
                    LayoutUrl = "~/Areas/FRAS/Views/Shared/_Layout.cshtml";
                    break;
                case Incident:
                    LayoutUrl = "~/Areas/Incident/Views/Shared/_Layout.cshtml";
                    break;
                case Training:
                    LayoutUrl = "~/Areas/Training/Views/Shared/_Layout.cshtml";
                    break;
                case Work:
                    LayoutUrl = "~/Areas/Work/Views/Shared/_Layout.cshtml";
                    break;
                case HIRA:
                    LayoutUrl = "~/Areas/Hira/Views/Shared/_Layout.cshtml";
                    break;
                default:
                    LayoutUrl = "~/Views/Shared/_Layout_BS.cshtml";
                    break;
            }

            return LayoutUrl;
        }
    };

    /// <summary>
    /// http://www.codedigest.com/CodeDigest/207-Get-All-Language-Country-Code-List-for-all-Culture-in-C---ASP-Net.aspx
    /// </summary>
    public class LanguagePostFix
    {
        public const string EnglishUS = "en-US";

        const string Swedish = "sv-SE";

        /// <summary>
        /// nb-NO
        /// </summary>
        const string Norwegian = "nb-NO";

        /// <summary>
        ///  da/da-DK
        /// </summary>
        const string Danish = "da-DK";

        /// <summary>
        /// fi
        /// </summary>
        const string Finnish = "fi-FI";

        /// <summary>
        /// fr-FR
        /// </summary>
        const string French = "fr-FR";
        /// <summary>
        /// pt-PT
        /// </summary>
        const string Portuguese = "pt-PT";

        /// <summary>
        /// de-DE
        /// </summary>
        const string German = "de-DE";

        /// <summary>
        /// India Hindi
        /// </summary>
        const string Hindi = "hi-IN";

        public static string ConvertlanguageCodeToGlobalCode(string CurrentLanguageCode)
        {
            var newCode = "";
            //for reference http://www.codedigest.com/CodeDigest/207-Get-All-Language-Country-Code-List-for-all-Culture-in-C---ASP-Net.aspx
            switch (CurrentLanguageCode)
            {
                case "SV": { newCode = (string)LanguagePostFix.Swedish; break; }
                case "FR": { newCode = (string)LanguagePostFix.French; break; }
                case "NO": { newCode = (string)LanguagePostFix.Norwegian; break; }
                case "DA": { newCode = (string)LanguagePostFix.Danish; break; }
                case "FI": { newCode = (string)LanguagePostFix.Finnish; break; }
                case "DE": { newCode = (string)LanguagePostFix.German; break; }
                case "PT": { newCode = (string)LanguagePostFix.Portuguese; break; }
                case "HI": { newCode = (string)LanguagePostFix.Hindi; break; }
                default: { newCode = (string)LanguagePostFix.EnglishUS; break; }
            }

            return newCode;
        }

    };

    public class Entity
    {
        public const string Task = "T";
        public const string Meeting = "M";
    }

    public static class GlobalConstant
    {
        public const string dd_MMM_yyyy = "dd/MMM/yyyy";
        public const string MMMM_dd_yyyy = "MMMM/dd/yyyy";
        public const string MM_dd_yyyy = "MM/dd/yyyy";
        public const string MM_dd_yy = "MM/dd/yy";

        /// <summary>
        /// for 12 hour Clock
        /// </summary>
        public const string dd_MMM_yyyy_hh_mm = "dd/MMM/yyyy hh:mm";

        /// <summary>
        /// for 24 hour Clock
        /// </summary>
        public const string dd_MMM_yyyy_HH_mm = "dd/MMM/yyyy HH:mm";

        public const string dd_MM_yyyy = "dd/MM/yyyy";
        /// <summary>
        /// for 12 hour Clock
        /// </summary>
        public const string hh_mm_ss = "hh:mm:ss";
        /// <summary>
        /// for 24 hour Clock
        /// </summary>
        public const string HH_mm_ss = "HH:mm:ss";

        /// <summary>
        /// for 12 hour Clock
        /// </summary>
        public const string hh_mm = "hh:mm";

        /// <summary>
        /// for 24 hour Clock
        /// </summary>
        public const string HH_mm = "HH:mm";

        /// <summary>
        /// Format is dd-MMM-yyyy
        /// </summary>
        /// <param name="date"></param>
        /// <returns>e.g 25-Jan-2017</returns>
        internal static string DateFormat(DateTime? date)
        {
            if (date != null)
            {
                return Convert.ToDateTime(date.ToString()).ToString(dd_MMM_yyyy);
            }

            return string.Empty;
        }

        /// <summary>
        /// Format is dd-MMM-yyyy hh:mm:ss tt(AM/PM)
        /// </summary>
        /// <param name="date"></param>
        /// <returns>e.g 25-Jan-2017 10:12 AM</returns>
        /// 
        internal static string DateTimeAMPMFormat(DateTime? date)
        {
            if (date != null)
            {
                var sec = Convert.ToDateTime(date.ToString()).Second;
                var str = ":ss";
                /*if (sec == 0)*/
                str = "";
                str = Convert.ToDateTime(date.ToString()).ToString(dd_MMM_yyyy_hh_mm + str + " tt");
                str = str.Replace(":00", "");
                return str;
            }

            return string.Empty;
        }

        /// <summary>
        /// Format is hh:mm:ss tt(AM/PM)
        /// </summary>
        /// <param name="date"></param>
        /// <returns>e.g 10:12 AM</returns>
        /// 
        internal static string TimeAMPMFormat(DateTime? date)
        {
            if (date != null)
            {
                var sec = Convert.ToDateTime(date.ToString()).Second;
                var str = ":ss";
                //if (sec == 0)
                str = "";
                return Convert.ToDateTime(date.ToString()).ToString("hh:mm" + str + " tt");
            }

            return string.Empty;
        }

        /// <summary>
        /// Format is hh:mm:ss tt(AM/PM)
        /// </summary>
        /// <param name="date"></param>
        /// <returns>e.g 10:12 AM</returns>
        /// 
        internal static string TimeFormat(TimeSpan? date)
        {
            if (date != null)
            {
                var sec = Convert.ToDateTime(date.ToString()).Second;
                var str = ":ss";
                //if (sec == 0)
                str = "";
                return Convert.ToDateTime(date.ToString()).ToString("hh:mm" + str + " tt");
            }

            return string.Empty;
        }
    }
};
