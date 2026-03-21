using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class Participant
    {
        public int Id { get; set; }
        public string Name { get; set; } // Puede ser seudónimo (Ej: "Participante A")
        public int Age { get; set; }
        public string Profile { get; set; } // Ej: "Estudiante de Ingeniería"
        public ICollection<TestSession> Sessions { get; set; }
    }
}
