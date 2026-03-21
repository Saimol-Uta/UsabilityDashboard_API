
using Domain.Common;

namespace Domain.Entities
{
    public class ImprovementAction : BaseEntity
    {
        public Guid FindingId { get; set; }

        public string Description { get; set; }
        public ActionStatus Status { get; set; } = ActionStatus.Open;
        public PriorityLevel Priority { get; set; }
        public DateTime? ImplementedDate { get; set; }
        public DateTime CreatedAt { get; set; }

        public Finding Finding { get; set; }
    }
}
