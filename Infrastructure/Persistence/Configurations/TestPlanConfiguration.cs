using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Persistence.Configurations
{
    public class TestPlanConfiguration : IEntityTypeConfiguration<TestPlan>
    {
        public void Configure(EntityTypeBuilder<TestPlan> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.ProjectName).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Product).IsRequired().HasMaxLength(200);
            builder.Property(x => x.EvaluatedModule).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Objective).IsRequired().HasMaxLength(1000);
            builder.Property(x => x.UserProfile).IsRequired().HasMaxLength(500);
            builder.Property(x => x.Methodology).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Location).HasMaxLength(300);
            builder.Property(x => x.EstimatedDuration).HasMaxLength(100);
            builder.Property(x => x.Scope).HasMaxLength(1000);

            // Enum guardado como string en la BD
            builder.Property(x => x.Status)
                .HasConversion<string>()
                .HasMaxLength(50);

            // Relaciones
            builder.HasOne(x => x.ModeratorScript)
                .WithOne(x => x.TestPlan)
                .HasForeignKey<ModeratorScript>(x => x.TestPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Tasks)
                .WithOne(x => x.TestPlan)
                .HasForeignKey(x => x.TestPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Sessions)
                .WithOne(x => x.TestPlan)
                .HasForeignKey(x => x.TestPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Findings)
                .WithOne(x => x.TestPlan)
                .HasForeignKey(x => x.TestPlanId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
