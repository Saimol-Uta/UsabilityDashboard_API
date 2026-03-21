using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class ObservationLog
    {
        public int Id { get; set; }
        public int TestSessionId { get; set; } 
        public int TestTaskId { get; set; }

        public bool TaskSuccess { get; set; }
        public int TimeSeconds { get; set; }
        public int ErrorCount { get; set; }
        public string Comments { get; set; }

        public string DetectedProblem { get; set; }
        public string Severity { get; set; }
        public string ProposedImprovement { get; set; }

        public DateTime CreatedAt { get; set; }

        public TestSession TestSession { get; set; }
        public TestTask TestTask { get; set; }
    }
}
