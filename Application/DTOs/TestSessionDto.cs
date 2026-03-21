using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public record TestSessionDto(
     Guid Id,
     Guid TestPlanId,
     Guid ParticipantId,
     string ParticipantName,
     DateTime Date,
     string PlatformTested,
     DateTime CreatedAt
 );

    public record CreateTestSessionDto(
        Guid TestPlanId,
        Guid ParticipantId,
        DateTime Date,
        string PlatformTested
    );

    public record UpdateTestSessionDto(
        Guid ParticipantId,
        DateTime Date,
        string PlatformTested
    );
}
