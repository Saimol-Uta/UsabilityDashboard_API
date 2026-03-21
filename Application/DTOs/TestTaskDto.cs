using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public record TestTaskDto(
    Guid Id,
    Guid TestPlanId,
    int TaskNumber,
    string Scenario,
    string ExpectedResult,
    string MainMetric,
    string SuccessCriteria,
    int MaxTimeSeconds
);

    public record CreateTestTaskDto(
        Guid TestPlanId,
        int TaskNumber,
        string Scenario,
        string ExpectedResult,
        string MainMetric,
        string SuccessCriteria,
        int MaxTimeSeconds
    );

    public record UpdateTestTaskDto(
        string Scenario,
        string ExpectedResult,
        string MainMetric,
        string SuccessCriteria,
        int MaxTimeSeconds
    );
}
