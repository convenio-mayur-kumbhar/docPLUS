using Microsoft.AspNetCore.Mvc;

namespace DocPlus.Controllers
{
    public class StatusMasterController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
