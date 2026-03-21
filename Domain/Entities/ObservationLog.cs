using Domain.Common;

namespace Domain.Entities
{
    public class ObservationLog : BaseEntity
    {
        public Guid TestSessionId { get; set; } 
        public Guid TestTaskId { get; set; }

        public bool TaskSuccess { get; set; }
        public int TimeSeconds { get; set; }
        public int ErrorCount { get; set; }
        public string Comments { get; set; }

        public string DetectedProblem { get; set; }
        public SeverityLevel Severity { get; set; }
        public string ProposedImprovement { get; set; }

        public DateTime CreatedAt { get; set; }

        public TestSession TestSession { get; set; }
        public TestTask TestTask { get; set; }
    }
}
