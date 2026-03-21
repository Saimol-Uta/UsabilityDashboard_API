using Application.Interfaces;
using Application.Mappings;
using Application.Services;
using Application.Validators;
using FluentValidation;

namespace UsabilityDashboard_API.Extensions;

public static class ApplicationExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // AutoMapper
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(MappingProfile).Assembly));

        // Servicios
        services.AddValidatorsFromAssemblyContaining<CreateTestPlanValidator>();
        services.AddScoped<ITestPlanService, TestPlanService>();
        services.AddScoped<ITestTaskService, TestTaskService>();
        services.AddScoped<IParticipantService, ParticipantService>();
        services.AddScoped<IFindingService, FindingService>();
        services.AddScoped<IObservationLogService, ObservationLogService>();
        services.AddScoped<IImprovementActionService, ImprovementActionService>();
        services.AddScoped<IModeratorScriptService, ModeratorScriptService>();
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}