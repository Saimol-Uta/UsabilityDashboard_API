
using UsabilityDashboard_API.Extensions;
using UsabilityDashboard_API.Middlewares;

namespace UsabilityDashboard_API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();
            builder.Services.AddInfrastructure(builder.Configuration);
            builder.Services.AddApplication();
            builder.Services.AddSwaggerDocs();
            builder.Services.AddCorsPolicy();
            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }
            app.UseCors("DashboardPolicy");
            app.UseMiddleware<ExceptionMiddleware>();
            app.UseSwaggerDocs();
            app.UseHttpsRedirection();

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
