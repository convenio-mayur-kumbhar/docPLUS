using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace DocPlus.Utilities.APIHelperUtility
{
    public class ApiError
    {
        public static bool IsError { get; set; }
        public static string ExceptionMessage { get; set; }
        public static IEnumerable<ValidationError> ValidationErrors { get; set; }

        /// <summary>
        /// This Method Returns Errors In ModelState
        /// </summary>
        /// <param name="modelState"></param>
        /// <returns></returns>
        public static BadRequestObjectResult ModelStateErrorResponse(ModelStateDictionary modelState)
        {
            IsError = true;
            if (modelState != null && modelState.Any(m => m.Value.Errors.Count > 0))
            {
                ExceptionMessage = "Correct Specified Values";
                ValidationErrors = modelState.Keys.SelectMany(key => modelState[key].Errors.Select(x => new ValidationError(key, x.ErrorMessage))).ToList();
            }

            /* Anonymous Object For Response */
            var Response = new
            {
                IsError,
                ExceptionMessage,
                ValidationErrors,
                StatusCode = 406
            };

            return new BadRequestObjectResult(Response);
        }
    }
}
