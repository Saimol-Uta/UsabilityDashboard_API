using Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class ModeratorScript : BaseEntity
    {
        public Guid TestPlanId { get; set; }

        public string Introduction { get; set; }
        public string FollowUpQuestions { get; set; }
        public string ClosingInstructions { get; set; }

        public TestPlan TestPlan { get; set; }
    }
}
