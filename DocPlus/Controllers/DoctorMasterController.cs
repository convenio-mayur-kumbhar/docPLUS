using Microsoft.AspNetCore.Mvc;

namespace DocPlus.Controllers
{
    public class DoctorMasterController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
