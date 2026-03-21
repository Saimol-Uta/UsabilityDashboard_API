using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public record DashboardStatsDto(
     int TotalObservations,
     double SuccessRate,
     double AverageTimeSeconds,
     int TotalErrors,
     int TotalFindings,
     int CriticalFindings,
     int ModerateFindings,
     int TotalActions,
     int CompletedActions,
     int PendingActions,
     int InProgressActions,
     IEnumerable<ErrorsBySeverityDto> ErrorsBySeverity,
     IEnumerable<SuccessByTaskDto> SuccessByTask,
     IEnumerable<PlatformStatsDto> StatsByPlatform  
 );

    public record ErrorsBySeverityDto(string Severity, int Count);

    public record SuccessByTaskDto(
        Guid TaskId,
        int Total,
        int Successes,
        double AvgTime
    );
    public record PlatformStatsDto(
        string Platform,
        int TotalObservations,
        int Successes,
        double AvgTimeSeconds
    );
}
