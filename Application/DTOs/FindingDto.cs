using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public record FindingDto(
     Guid Id,
     Guid TestPlanId,
     string Description,
     string Frequency,
     string Severity,
     string Priority,
     string Status,
     string Recommendation,
     string Category,
     string Tool,
     DateTime CreatedAt
 );

    public record CreateFindingDto(
        Guid TestPlanId,
        string Description,
        string Frequency,
        string Severity,
        string Priority,
        string Recommendation,
        string Category,
        string Tool
    );

    public record UpdateFindingDto(
        string Description,
        string Frequency,
        string Severity,
        string Priority,
        string Status,
        string Recommendation,
        string Category,
        string Tool
    );
}
