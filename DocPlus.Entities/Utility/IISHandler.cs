using Newtonsoft.Json.Converters;

/// <summary>
/// Model Attribute Handlar This will use when your post data json in string and you trying to deserialized string to model, some time
/// with other then english globalization datetime format r different
/// </summary>
namespace DocPlus.Entities.Utility
{
    /// <summary>
    /// For date
    /// https://stackoverflow.com/questions/18635599/specifying-a-custom-datetime-format-when-serializing-with-json-net/36174312
    /// </summary>
    public class DateFormatConverter : IsoDateTimeConverter
    {
        public DateFormatConverter(string format = GlobalConstant.dd_MMM_yyyy)
        {
            DateTimeFormat = format;
        }

        public DateFormatConverter()
        {
            DateTimeFormat = GlobalConstant.dd_MMM_yyyy;
        }
    };

    /// <summary>
    /// For date Time
    /// https://stackoverflow.com/questions/18635599/specifying-a-custom-datetime-format-when-serializing-with-json-net/36174312
    /// use only when you upload data with file
    /// </summary>
    public class DateTimeFormatConverter : IsoDateTimeConverter
    {
        public DateTimeFormatConverter(string formatformat = GlobalConstant.dd_MMM_yyyy_HH_mm)
        {
            DateTimeFormat = formatformat;
        }

        public DateTimeFormatConverter()
        {
            DateTimeFormat = GlobalConstant.dd_MMM_yyyy_HH_mm;
        }
    };

    /// <summary>
    /// For Time
    /// https://stackoverflow.com/questions/18635599/specifying-a-custom-datetime-format-when-serializing-with-json-net/36174312
    /// use only when you upload data with file
    /// </summary>
    public class TimeFormatConverter : IsoDateTimeConverter
    {
        public TimeFormatConverter(string formatformat = GlobalConstant.HH_mm_ss)
        {
            DateTimeFormat = formatformat;
        }

        public TimeFormatConverter()
        {
            DateTimeFormat = GlobalConstant.HH_mm_ss;
        }
    };

};