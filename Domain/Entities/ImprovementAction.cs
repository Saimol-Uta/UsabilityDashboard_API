using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class ImprovementAction
    {
        public int Id { get; set; }
        public int FindingId { get; set; }

        public string Description { get; set; }
        public string Status { get; set; }
        public string Priority { get; set; }
        public DateTime? ImplementedDate { get; set; }
        public DateTime CreatedAt { get; set; }

        public Finding Finding { get; set; }
    }
}
