namespace UsabilityDashboard_API.Extensions;

public static class CorsExtensions
{
    public static IServiceCollection AddCorsPolicy(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("DashboardPolicy", policy =>
            {
                policy
                    .WithOrigins(
                        "http://localhost:3000",  // React
                        "http://localhost:4200",  // Angular
                        "http://localhost:5173"   // Vite
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        return services;
    }
}