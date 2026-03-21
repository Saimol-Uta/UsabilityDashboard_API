using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Persistence.Configurations
{
    public class FindingConfiguration : IEntityTypeConfiguration<Finding>
    {
        public void Configure(EntityTypeBuilder<Finding> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Description).IsRequired().HasMaxLength(1000);
            builder.Property(x => x.Recommendation).HasMaxLength(1000);
            builder.Property(x => x.Category).HasMaxLength(200);
            builder.Property(x => x.Tool).HasMaxLength(200);
            builder.Property(x => x.Frequency).HasMaxLength(100);

            // Enums como string
            builder.Property(x => x.Severity).HasConversion<string>().HasMaxLength(50);
            builder.Property(x => x.Priority).HasConversion<string>().HasMaxLength(50);
            builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);

            builder.HasMany(x => x.ImprovementActions)
                .WithOne(x => x.Finding)
                .HasForeignKey(x => x.FindingId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
