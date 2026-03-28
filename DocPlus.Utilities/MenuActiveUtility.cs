using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Routing;
namespace DocPlus.Utilities
{
    /// <summary>
    /// this utility is used to set the active menu
    /// sorce: "https://stackoverflow.com/questions/20410623/how-to-add-active-class-to-html-actionlink-in-asp-net-mvc"
    /// </summary>
    public static class MenuActiveUtility
    {
        public static string IsActive(this IHtmlHelper Html, string ControllerName, string ActionName)
        {
            RouteData routeData = Html.ViewContext.RouteData;

            string routeAction = (string)routeData.Values["action"];
            string routeController = (string)routeData.Values["controller"];

            // both must match
            bool returnActive = ControllerName == routeController && ActionName == routeAction;

            return returnActive ? "kt-menu__item--active" : "";
        }
    }
}
