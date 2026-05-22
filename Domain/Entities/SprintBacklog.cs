using Domain.Common;
using System;

namespace Domain.Entities
{
    public class SprintBacklog : BaseEntity
    {
        public Guid TestPlanId { get; set; }
        
        public string SprintName { get; set; } = string.Empty;
        public string SprintGoal { get; set; } = string.Empty;
        
        // Almacena el JSON estructurado con las historias, tareas y criterios
        public string ContentJson { get; set; } = "{}";
        
        // Almacena el borrador en formato Markdown (editable por el usuario)
        public string RawMarkdown { get; set; } = string.Empty;

        // Relación con el Plan de Pruebas
        public TestPlan TestPlan { get; set; } = null!;
    }
}
