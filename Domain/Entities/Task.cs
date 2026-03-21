using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class TestTask
    {
        public int Id { get; set; }
        public int TestPlanId { get; set; }
        public int TaskNumber { get; set; }

        public string Scenario { get; set; }
        public string ExpectedResult { get; set; }
        public string MainMetric { get; set; } // Añadido: Métrica principal obligatoria
        public string SuccessCriteria { get; set; }
        public int MaxTimeSeconds { get; set; }
        public TestPlan TestPlan { get; set; }
        public ICollection<ObservationLog> ObservationLogs { get; set; }
    }
}
