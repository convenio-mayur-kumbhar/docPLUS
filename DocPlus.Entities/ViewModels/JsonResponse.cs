using System.Globalization;

namespace DocPlus.Entities.ViewModels
{
    public class JsonResponse
    {
        public JsonResponse()
        {

        }
        public JsonResponse(string Status, string Message, object Data)
        {
            this.Status = Status;
            this.Message = Message;
            this.Data = Data;
        }
        public string Status { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }
    }

    public static class DateHelper
    {
        public static string GetDateFormat(DateTime? date, string format)
        {
            string formattedDate = string.Empty;
            try
            {
                formattedDate = (Convert.ToDateTime(date)).ToString(format, CultureInfo.InvariantCulture);
            }
            catch { }
            return formattedDate;
        }
    }
}
