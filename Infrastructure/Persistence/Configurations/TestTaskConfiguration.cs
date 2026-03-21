using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Persistence.Configurations
{
    public class TestTaskConfiguration : IEntityTypeConfiguration<TestTask>
    {
        public void Configure(EntityTypeBuilder<TestTask> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Scenario).IsRequired().HasMaxLength(1000);
            builder.Property(x => x.ExpectedResult).IsRequired().HasMaxLength(1000);
            builder.Property(x => x.MainMetric).IsRequired().HasMaxLength(200);
            builder.Property(x => x.SuccessCriteria).HasMaxLength(500);

            builder.HasMany(x => x.ObservationLogs)
                .WithOne(x => x.TestTask)
                .HasForeignKey(x => x.TestTaskId)
                .OnDelete(DeleteBehavior.NoAction); // evita múltiples cascade paths
        }
    }
}
