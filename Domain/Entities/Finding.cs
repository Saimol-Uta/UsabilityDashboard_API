using Domain.Common;

namespace Domain.Entities
{
    public class Finding : BaseEntity
    {
        public Guid TestPlanId { get; set; }
        public string Description { get; set; }
        public string Frequency { get; set; }
        public SeverityLevel Severity { get; set; }
        public PriorityLevel Priority { get; set; }
        public ActionStatus Status { get; set; } = ActionStatus.Open;
        public string Recommendation { get; set; }
        public string Category { get; set; }
        public string Tool { get; set; } 
        public DateTime CreatedAt { get; set; }

        public TestPlan TestPlan { get; set; }
        public ICollection<ImprovementAction> ImprovementActions { get; set; }
    }
}
