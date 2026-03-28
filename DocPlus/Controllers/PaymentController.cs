using Microsoft.AspNetCore.Mvc;

namespace DocPlus.Controllers
{
    public class PaymentController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}