using System.Reflection;
using System.Resources;

namespace DocPlus
{
    public static class LocalizerHelper
    {
        private static ResourceManager rm =
            new ResourceManager("DocPlus.Resources.SharedResource",
            Assembly.GetExecutingAssembly());

        public static string Get(string key)
        {
            return rm.GetString(key) ?? key;
        }
    }
}