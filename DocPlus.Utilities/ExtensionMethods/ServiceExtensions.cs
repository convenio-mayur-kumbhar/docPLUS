using Microsoft.Extensions.DependencyInjection;

namespace DocPlus.Utilities.ExtensionMethods
{
    public static class ServiceExtensions
    {
        /// <summary>
        /// This Method Injects The Cors Mechanism Into Request Processing Pipline
        /// </summary>
        /// <param name="services"></param>
        public static void ConfigureCors(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy", builder =>
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader());
            });
        }
    }
}
