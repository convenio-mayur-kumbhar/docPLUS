using Microsoft.AspNetCore.Mvc;

namespace DocPlus.Controllers
{
    public class UserMasterController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
