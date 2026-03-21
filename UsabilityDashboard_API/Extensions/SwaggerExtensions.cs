namespace UsabilityDashboard_API.Extensions
{
    public static class SwaggerExtensions
    {
        public static IServiceCollection AddSwaggerDocs(this IServiceCollection services)
        {
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new()
                {
                    Title = "Usability Dashboard API",
                    Version = "v1",
                    Description = "API para gestión de pruebas de usabilidad"
                });
            });

            return services;
        }

        public static WebApplication UseSwaggerDocs(this WebApplication app)
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "Usability Dashboard v1");
                options.RoutePrefix = string.Empty; // Swagger en la raíz "/"
            });

            return app;
        }
    }
}
