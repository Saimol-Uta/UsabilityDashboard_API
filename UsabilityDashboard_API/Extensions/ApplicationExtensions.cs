using Application.Interfaces;
using Application.Mappings;
using Application.Services;

namespace UsabilityDashboard_API.Extensions
{
    public static class ApplicationExtensions
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            // AutoMapper
            services.AddAutoMapper(typeof(MappingProfile).Assembly);

            // Servicios
            services.AddScoped<ITestPlanService, TestPlanService>();
            services.AddScoped<ITestTaskService, TestTaskService>();
            services.AddScoped<IParticipantService, ParticipantService>();
            services.AddScoped<IFindingService, FindingService>();

            return services;
        }
    }
}
