using DocPlus.Entities.Utility;

namespace DocPlus.Entities.ViewModels
{
    public abstract class Base_VM
    {
        public bool? IsActive { get; set; }

        #region Login User Details

        public int CurrentEndUserID { get; set; }

        public int CurrentUserRoleID { get; set; }

        public short CurrentScreenID { get; set; }

        public string? AccessPoint { get; set; }
        public string? IsAddOrUpdate { get; set; }

        public decimal? CurrentUTCOffset { get; set; }

        #endregion Login User Details

        #region Data formating
        /// <summary>
        /// Format is dd-MMM-yyyy
        /// </summary>
        /// <param name="date"></param>
        /// <returns>e.g 25-Jan-2017</returns>
        /// 
        internal string DateFormatMM_dd_yy(DateTime? date)
        {
            if (date != null)
            {
                return Convert.ToDateTime(date.ToString()).ToString(GlobalConstant.MM_dd_yy);
            }

            return string.Empty;
        }
        internal string DateFormat(DateTime? date)
        {
            if (date != null)
            {
                return Convert.ToDateTime(date.ToString()).ToString(GlobalConstant.MM_dd_yyyy);
            }

            return string.Empty;
        }
        internal string DateTimeFormat(DateTime? date)
        {
            if (date != null)
            {
                return Convert.ToDateTime(date.ToString()).ToString(GlobalConstant.dd_MMM_yyyy_HH_mm);
            }

            return string.Empty;
        }


        /// <summary>
        /// Format is dd-MMM-yyyy hh:mm:ss tt(AM/PM)
        /// </summary>
        /// <param name="date"></param>
        /// <returns>e.g 25-Jan-2017 10:12 AM</returns>
        /// 
        internal string DateTimeAMPMFormat(DateTime? date)
        {
            if (date != null)
            {
                //var sec = Convert.ToDateTime(date.ToString()).Second;
                var str = ":ss";
                /*if (sec == 0)*/
                str = "";
                str = Convert.ToDateTime(date.ToString()).ToString(GlobalConstant.dd_MMM_yyyy_HH_mm + str /*+ " tt"*/);
                //str = str.Replace(":00", "");
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
        internal string TimeAMPMFormat(DateTime? date)
        {
            if (date != null)
            {
                //var sec = Convert.ToDateTime(date.ToString()).Second;
                var str = ":ss";
                //if (sec == 0)
                str = "";
                return Convert.ToDateTime(date.ToString()).ToString(GlobalConstant.HH_mm + str /*+ " tt"*/);
            }

            return string.Empty;
        }

        /// <summary>
        /// Format is hh:mm:ss tt(AM/PM)
        /// </summary>
        /// <param name="date"></param>
        /// <returns>e.g 10:12 AM</returns>
        /// 
        internal string TimeFormat(TimeSpan? date)
        {
            if (date != null)
            {
                //var sec = Convert.ToDateTime(date.ToString()).Second;
                var str = ":ss";
                //if (sec == 0)
                str = "";
                return Convert.ToDateTime(date.ToString()).ToString(GlobalConstant.HH_mm + str /*+ " tt"*/);
            }

            return string.Empty;
        }

        public bool SequenceColumn { get; set; }

        #endregion Data formating

    }
};