using Domain.Interfaces;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace UsabilityDashboard_API.Extensions
{
    public static class InfrastructureExtensions
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

            // Registra el repositorio genérico para todas las entidades
            services.AddScoped(typeof(IRepository<>), typeof(GenericRepository<>));

            return services;
        }
    }
}
