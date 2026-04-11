using DocPlus.Operations.Repository;
using Microsoft.Extensions.DependencyInjection;

namespace DocPlus.App_Start
{
    public class DependencyInjectionConfig
    {
        /// <summary>
        /// Add Scoped Dependency In This Method
        /// </summary>
        /// <param name="services"></param>
        public static void AddScope(IServiceCollection services)
        { }

        /// <summary>
        /// Add Singlton Dependency In This Method
        /// </summary>
        /// <param name="services"></param>
        public static void AddSinglton(IServiceCollection services)
        {
            services.AddSingleton<ILoginRepository, LoginRepository>();
            services.AddSingleton<IPatientRepository, PatientRepository>();
            services.AddSingleton<IClinicalRepository, ClinicalRepository>();   
            services.AddSingleton<IAjaxCommonRepository, AjaxCommonRepository>();   
            services.AddSingleton<IAppointmentRepository, AppointmentRepository>();
            services.AddSingleton<IProfessionMasterRepository, ProfessionMasterRepository>();
            services.AddSingleton<ICategoryMasterRepository, CategoryMasterRepository>();
            services.AddSingleton<IStatusMasterRepository, StatusMasterRepository>();
            services.AddSingleton<IOccupationMasterRepository, OccupationMasterRepository>();
            services.AddSingleton<IICD10MasterRepository, ICD10MasterRepository>();
            services.AddSingleton<IDSM4MasterRepository, DSM4MasterRepository>();
            services.AddSingleton<IDoctorMasterRepository, DoctorMasterRepository>();
        }


        /// <summary>
        /// Add Transient Depedency In This Method
        /// </summary>
        /// <param name="services"></param>
        public static void AddTransient(IServiceCollection services)
        { }
    }
}
