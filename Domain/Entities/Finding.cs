using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class Finding
    {
        public int Id { get; set; }
        public int TestPlanId { get; set; }
        public string Description { get; set; }
        public string Frequency { get; set; }
        public string Severity { get; set; }
        public string Priority { get; set; }
        public string Status { get; set; } 
        public string Recommendation { get; set; }
        public string Category { get; set; }
        public string Tool { get; set; } 
        public DateTime CreatedAt { get; set; }

        public TestPlan TestPlan { get; set; }
        public ICollection<ImprovementAction> ImprovementActions { get; set; }
    }
}
