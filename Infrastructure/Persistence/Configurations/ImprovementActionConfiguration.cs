using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Persistence.Configurations
{
    public class ImprovementActionConfiguration : IEntityTypeConfiguration<ImprovementAction>
    {
        public void Configure(EntityTypeBuilder<ImprovementAction> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Description).IsRequired().HasMaxLength(1000);
            builder.Property(x => x.Status).HasConversion<string>().HasMaxLength(50);
            builder.Property(x => x.Priority).HasConversion<string>().HasMaxLength(50);
        }
    }
}
