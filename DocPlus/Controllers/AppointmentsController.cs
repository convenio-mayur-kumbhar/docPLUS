using Microsoft.AspNetCore.Mvc;

namespace DocPlus.Controllers
{
    public class AppointmentsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
