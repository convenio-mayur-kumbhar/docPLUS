using Microsoft.AspNetCore.Mvc;

namespace DocPlus.Controllers
{
    public class PatientRegistrationsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }

}