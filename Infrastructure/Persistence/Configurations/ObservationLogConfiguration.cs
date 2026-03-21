using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Persistence.Configurations
{
    public class ObservationLogConfiguration : IEntityTypeConfiguration<ObservationLog>
    {
        public void Configure(EntityTypeBuilder<ObservationLog> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Comments).HasMaxLength(1000);
            builder.Property(x => x.DetectedProblem).HasMaxLength(1000);
            builder.Property(x => x.ProposedImprovement).HasMaxLength(1000);
            builder.Property(x => x.Severity).HasConversion<string>().HasMaxLength(50);
        }
    }
}
