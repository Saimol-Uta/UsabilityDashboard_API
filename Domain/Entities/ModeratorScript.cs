using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class ModeratorScript
    {
        public int Id { get; set; }
        public int TestPlanId { get; set; }

        public string Introduction { get; set; }
        public string FollowUpQuestions { get; set; }
        public string ClosingInstructions { get; set; }

        public TestPlan TestPlan { get; set; }
    }
}
