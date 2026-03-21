
using Domain.Common;

namespace Domain.Entities
{
    public class ImprovementAction : BaseEntity
    {
        public Guid FindingId { get; set; }

        public string Description { get; set; }
        public string Status { get; set; }
        public string Priority { get; set; }
        public DateTime? ImplementedDate { get; set; }
        public DateTime CreatedAt { get; set; }

        public Finding Finding { get; set; }
    }
}
