using Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class TestPlan : BaseEntity
    {
        public string ProjectName { get; set; }
        public string Product { get; set; }
        public string EvaluatedModule { get; set; }
        public string Objective { get; set; }
        public string UserProfile { get; set; }
        public string Methodology { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Location { get; set; }
        public string EstimatedDuration { get; set; }

        public string Scope { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public ModeratorScript ModeratorScript { get; set; }
        public ICollection<TestTask> Tasks { get; set; }
        public ICollection<TestSession> Sessions { get; set; } 
        public ICollection<Finding> Findings { get; set; }
    }
}
