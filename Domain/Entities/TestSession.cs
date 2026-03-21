using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class TestSession
    {
        public int Id { get; set; }
        public int TestPlanId { get; set; }
        public int ParticipantId { get; set; }

        public DateTime Date { get; set; }
        public string PlatformTested { get; set; } 

        public TestPlan TestPlan { get; set; }
        public Participant Participant { get; set; }
        public ICollection<ObservationLog> ObservationLogs { get; set; }
    }
}
