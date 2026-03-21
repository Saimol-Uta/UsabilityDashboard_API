using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Persistence.Configurations
{
    public class TestSessionConfiguration : IEntityTypeConfiguration<TestSession>
    {
        public void Configure(EntityTypeBuilder<TestSession> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.PlatformTested).HasMaxLength(200);

            builder.HasOne(x => x.Participant)
                .WithMany(x => x.Sessions)
                .HasForeignKey(x => x.ParticipantId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.ObservationLogs)
                .WithOne(x => x.TestSession)
                .HasForeignKey(x => x.TestSessionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
