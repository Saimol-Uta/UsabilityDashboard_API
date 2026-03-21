using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public record ObservationLogDto(
    Guid Id,
    Guid TestSessionId,
    Guid TestTaskId,
    bool TaskSuccess,
    int TimeSeconds,
    int ErrorCount,
    string Comments,
    string DetectedProblem,
    string Severity,
    string ProposedImprovement,
    DateTime CreatedAt
);

    public record CreateObservationLogDto(
        Guid TestSessionId,
        Guid TestTaskId,
        bool TaskSuccess,
        int TimeSeconds,
        int ErrorCount,
        string Comments,
        string DetectedProblem,
        string Severity,
        string ProposedImprovement
    );

    public record UpdateObservationLogDto(
        bool TaskSuccess,
        int TimeSeconds,
        int ErrorCount,
        string Comments,
        string DetectedProblem,
        string Severity,
        string ProposedImprovement
    );
}
