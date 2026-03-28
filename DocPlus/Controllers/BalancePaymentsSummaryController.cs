using Microsoft.AspNetCore.Mvc;

namespace DocPlus.Controllers
{
    public class BalancePaymentsSummaryController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
