using Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class TestSession : BaseEntity
    {
        public Guid TestPlanId { get; set; }
        public Guid ParticipantId { get; set; }

        public DateTime Date { get; set; }
        public string PlatformTested { get; set; } 

        public TestPlan TestPlan { get; set; }
        public Participant Participant { get; set; }
        public ICollection<ObservationLog> ObservationLogs { get; set; }
    }
}
