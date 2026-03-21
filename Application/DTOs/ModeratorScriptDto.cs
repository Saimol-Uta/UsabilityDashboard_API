using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public record ModeratorScriptDto(
    Guid Id,
    Guid TestPlanId,
    string Introduction,
    string FollowUpQuestions,
    string ClosingInstructions
    );

    public record CreateModeratorScriptDto(
        Guid TestPlanId,
        string Introduction,
        string FollowUpQuestions,
        string ClosingInstructions
    );

    public record UpdateModeratorScriptDto(
        string Introduction,
        string FollowUpQuestions,
        string ClosingInstructions
    );
}
