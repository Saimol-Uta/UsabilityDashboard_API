using Domain.Common;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;  // ← sin llaves {}

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

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                var now = DateTime.UtcNow;
                entry.Property(nameof(BaseEntity.CreatedAt)).CurrentValue = now;
                Console.WriteLine($"=== CurrentValue CreatedAt: {entry.Property(nameof(BaseEntity.CreatedAt)).CurrentValue} ===");
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Property(nameof(BaseEntity.UpdatedAt)).CurrentValue = DateTime.UtcNow;
            }
        }

        var result = await base.SaveChangesAsync(cancellationToken);
        Console.WriteLine($"=== Filas afectadas: {result} ===");
        return result;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}