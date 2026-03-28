using Microsoft.AspNetCore.Mvc;

namespace DocPlus.Controllers
{
    public class BillingController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
