using Microsoft.AspNetCore.Mvc;

namespace DocPlus.Controllers
{
    public class CategoryMasterController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
