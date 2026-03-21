using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public record ImprovementActionDto(
    Guid Id,
    Guid FindingId,
    string Description,
    string Status,
    string Priority,
    DateTime? ImplementedDate,
    DateTime CreatedAt
);

    public record CreateImprovementActionDto(
        Guid FindingId,
        string Description,
        string Priority
    );

    public record UpdateImprovementActionDto(
        string Description,
        string Status,
        string Priority,
        DateTime? ImplementedDate
    );

    public record UpdateStatusDto(string Status);

}
