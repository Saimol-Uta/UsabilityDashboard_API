using System;

namespace Application.DTOs
{
    public class SprintBacklogDto
    {
        public Guid Id { get; set; }
        public Guid TestPlanId { get; set; }
        public string SprintName { get; set; } = string.Empty;
        public string SprintGoal { get; set; } = string.Empty;
        public string ContentJson { get; set; } = "{}";
        public string RawMarkdown { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class GenerateBacklogRequestDto
    {
        public Guid TestPlanId { get; set; }
        public string? UserApiKey { get; set; }
    }

    public class SaveSprintBacklogDto
    {
        public string SprintName { get; set; } = string.Empty;
        public string SprintGoal { get; set; } = string.Empty;
        public string ContentJson { get; set; } = "{}";
        public string RawMarkdown { get; set; } = string.Empty;
    }

    public class ChatRequestDto
    {
        public string Prompt { get; set; } = string.Empty;
        public string ActivePageName { get; set; } = string.Empty;
        public string ContextJson { get; set; } = "[]";
    }
}
