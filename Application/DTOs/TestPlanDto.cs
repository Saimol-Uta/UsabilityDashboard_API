using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public record TestPlanDto(
    Guid Id,
    string ProjectName,
    string Product,
    string EvaluatedModule,
    string Objective,
    string UserProfile,
    string Methodology,
    DateTime StartDate,
    DateTime EndDate,
    string Location,
    string EstimatedDuration,
    string Scope,
    string Status,
    DateTime CreatedAt
);

    public record CreateTestPlanDto(
        string ProjectName,
        string Product,
        string EvaluatedModule,
        string Objective,
        string UserProfile,
        string Methodology,
        DateTime StartDate,
        DateTime EndDate,
        string Location,
        string EstimatedDuration,
        string Scope
    );

    public record UpdateTestPlanDto(
        string ProjectName,
        string Product,
        string EvaluatedModule,
        string Objective,
        string UserProfile,
        string Methodology,
        DateTime StartDate,
        DateTime EndDate,
        string Location,
        string EstimatedDuration,
        string Scope,
        string Status
    );
}
