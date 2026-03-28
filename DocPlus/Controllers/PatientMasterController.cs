using Microsoft.AspNetCore.Mvc;

namespace DocPlus.Controllers
{
    public class PatientMasterController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
