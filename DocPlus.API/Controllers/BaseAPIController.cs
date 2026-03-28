using DocPlus.Entities.Utility;
using Microsoft.AspNetCore.Mvc;
using log4net;
using System.Reflection;

namespace DocPlus.WebAPI.Controllers
{
    public class BaseAPIController : ControllerBase
    {
        public static readonly ILog logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        public string saveMessage { get { return "Saved Successfully!"; } }
        public string saveErrorMessage { get { return "Error occured while saving data!"; } }
        public string updateMessage { get { return "Updated successfully!"; } }
        public string updateErrorMessage { get { return "Error occured while updating data!"; } }
        public string deleteMessage { get { return "Deleted successfully!"; } }
        public string useInAnotherEntityMessage { get { return "Unable to delete record since it has been used!"; } }
        public string deleteErrorMessage { get { return "Error occured while deleting data!"; } }
        public string nullErrorMessage { get { return "Data cannot be null!"; } }

        public static string Encrypt(string data)
        {
            return Security.Encrypt(data);
        }

        public static string Decrypt(string data)
        {
            return Security.Decrypt(data);
        }

        public override CreatedResult Created(string actionName, object value)
        {
            var Response = new CreatedResult(actionName, value)
            {
                StatusCode = 201,
                Value = value
            };
            return base.Created(actionName, Response.Value);
        }
        public override BadRequestObjectResult BadRequest(object error)
        {
            var Response = new BadRequestObjectResult(error)
            {
                StatusCode = 400,
                Value = error
            };
            return base.BadRequest(Response.Value);
        }
        public override OkObjectResult Ok(object value)
        {
            var Response = new OkObjectResult(value)
            {
                StatusCode = 200,
                Value = value
            };

            return base.Ok(Response.Value);
        }
        public override AcceptedResult Accepted(object value)
        {
            var Response = new AcceptedResult()
            {
                StatusCode = 202,
                Value = value
            };
            return base.Accepted(Response.Value);
        }
        public override NotFoundObjectResult NotFound(object value)
        {
            var Response = new NotFoundObjectResult(value)
            {
                StatusCode = 404,
                Value = value
            };
            return base.NotFound(Response.Value);
        }
    }
}