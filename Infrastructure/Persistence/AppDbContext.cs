using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<TestPlan> TestPlans => Set<TestPlan>();
        public DbSet<TestTask> TestTasks => Set<TestTask>();
        public DbSet<ModeratorScript> ModeratorScripts => Set<ModeratorScript>();
        public DbSet<Participant> Participants => Set<Participant>();
        public DbSet<TestSession> TestSessions => Set<TestSession>();
        public DbSet<ObservationLog> ObservationLogs => Set<ObservationLog>();
        public DbSet<Finding> Findings => Set<Finding>();
        public DbSet<ImprovementAction> ImprovementActions => Set<ImprovementAction>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Aplica todas las configuraciones del ensamblado automáticamente
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
    }
}
