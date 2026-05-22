using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Application.Services
{
    public class SprintBacklogService : ISprintBacklogService
    {
        private readonly IRepository<TestPlan> _planRepository;
        private readonly IRepository<SprintBacklog> _backlogRepository;
        private readonly IRepository<TestTask> _taskRepository;
        private readonly IRepository<ModeratorScript> _scriptRepository;
        private readonly IRepository<TestSession> _sessionRepository;
        private readonly IRepository<Finding> _findingRepository;
        private readonly IRepository<ImprovementAction> _actionRepository;
        private static readonly HttpClient _httpClient = new HttpClient();

        public SprintBacklogService(
            IRepository<TestPlan> planRepository,
            IRepository<SprintBacklog> backlogRepository,
            IRepository<TestTask> taskRepository,
            IRepository<ModeratorScript> scriptRepository,
            IRepository<TestSession> sessionRepository,
            IRepository<Finding> findingRepository,
            IRepository<ImprovementAction> actionRepository)
        {
            _planRepository = planRepository;
            _backlogRepository = backlogRepository;
            _taskRepository = taskRepository;
            _scriptRepository = scriptRepository;
            _sessionRepository = sessionRepository;
            _findingRepository = findingRepository;
            _actionRepository = actionRepository;
        }

        public async Task<SprintBacklogDto?> GetByPlanIdAsync(Guid planId)
        {
            var backlog = (await _backlogRepository.GetAllAsync())
                .FirstOrDefault(x => x.TestPlanId == planId);

            if (backlog == null) return null;

            return MapToDto(backlog);
        }

        public async Task<SprintBacklogDto> SaveAsync(Guid planId, SaveSprintBacklogDto dto)
        {
            var existing = (await _backlogRepository.GetAllAsync())
                .FirstOrDefault(x => x.TestPlanId == planId);

            if (existing != null)
            {
                existing.SprintName = dto.SprintName;
                existing.SprintGoal = dto.SprintGoal;
                existing.ContentJson = dto.ContentJson;
                existing.RawMarkdown = dto.RawMarkdown;
                
                await _backlogRepository.UpdateAsync(existing);
                return MapToDto(existing);
            }
            else
            {
                var newBacklog = new SprintBacklog
                {
                    Id = Guid.NewGuid(),
                    TestPlanId = planId,
                    SprintName = dto.SprintName,
                    SprintGoal = dto.SprintGoal,
                    ContentJson = dto.ContentJson,
                    RawMarkdown = dto.RawMarkdown
                };

                var created = await _backlogRepository.AddAsync(newBacklog);
                return MapToDto(created);
            }
        }

        public async Task<SprintBacklogDto> GenerateAsync(Guid planId, string? userApiKey)
        {
            // 1. Recopilar toda la información registrada
            var plan = await _planRepository.GetByIdWithIncludesAsync(planId, x => x.Tasks);
            if (plan == null)
                throw new ArgumentException("El plan de pruebas especificado no existe.");

            var script = (await _scriptRepository.GetAllAsync())
                .FirstOrDefault(x => x.TestPlanId == planId);

            var sessions = (await _sessionRepository.GetAllWithIncludesAsync(x => x.ObservationLogs, x => x.Participant))
                .Where(x => x.TestPlanId == planId)
                .ToList();

            var findings = (await _findingRepository.GetAllWithIncludesAsync(x => x.ImprovementActions))
                .Where(x => x.TestPlanId == planId)
                .ToList();

            // 2. Determinar si usamos IA o el Motor Heurístico Local
            var apiKey = userApiKey ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");

            if (!string.IsNullOrEmpty(apiKey))
            {
                try
                {
                    return await GenerateWithAIAsync(plan, script, sessions, findings, apiKey);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[AI Generation Error] Fallback al motor local: {ex.Message}");
                    // Si la IA falla, hacemos fallback silencioso y robusto al motor local heurístico
                    return GenerateHeuristically(plan, script, sessions, findings);
                }
            }

            // Sin API Key -> Usamos el motor heurístico de inmediato
            return GenerateHeuristically(plan, script, sessions, findings);
        }

        private async Task<SprintBacklogDto> GenerateWithAIAsync(
            TestPlan plan,
            ModeratorScript? script,
            List<TestSession> sessions,
            List<Finding> findings,
            string apiKey)
        {
            // Construir el contexto en formato texto estructurado para el prompt
            var contextBuilder = new StringBuilder();
            contextBuilder.AppendLine($"Proyecto: {plan.ProjectName}");
            contextBuilder.AppendLine($"Producto evaluado: {plan.Product}");
            contextBuilder.AppendLine($"Módulo evaluado: {plan.EvaluatedModule}");
            contextBuilder.AppendLine($"Objetivo del plan: {plan.Objective}");
            contextBuilder.AppendLine($"Perfil de usuario: {plan.UserProfile}");
            contextBuilder.AppendLine($"Alcance: {plan.Scope}");

            if (script != null)
            {
                contextBuilder.AppendLine("\n--- GUIÓN DEL MODERADOR ---");
                contextBuilder.AppendLine($"Preguntas de seguimiento: {script.FollowUpQuestions}");
            }

            if (plan.Tasks != null && plan.Tasks.Any())
            {
                contextBuilder.AppendLine("\n--- TAREAS DE LA PRUEBA ---");
                foreach (var task in plan.Tasks.OrderBy(t => t.TaskNumber))
                {
                    contextBuilder.AppendLine($"- Tarea #{task.TaskNumber}: {task.Scenario}");
                    contextBuilder.AppendLine($"  Resultado esperado: {task.ExpectedResult}");
                    contextBuilder.AppendLine($"  Métrica: {task.MainMetric}");
                }
            }

            if (sessions.Any())
            {
                contextBuilder.AppendLine("\n--- REGISTRO DE OBSERVACIONES Y SESIONES ---");
                contextBuilder.AppendLine($"Total sesiones realizadas: {sessions.Count}");
                var logs = sessions.SelectMany(s => s.ObservationLogs).ToList();
                contextBuilder.AppendLine($"Total observaciones de tareas: {logs.Count}");
                contextBuilder.AppendLine($"Tasa de éxito de tareas: {(logs.Any() ? Math.Round((double)logs.Count(l => l.TaskSuccess) / logs.Count * 100, 1) : 0)}%");
                contextBuilder.AppendLine($"Tiempo promedio empleado: {(logs.Any() ? Math.Round(logs.Average(l => l.TimeSeconds), 1) : 0)} segundos");
                contextBuilder.AppendLine($"Total errores detectados: {logs.Sum(l => l.ErrorCount)}");
                
                var problemLogs = logs.Where(l => !string.IsNullOrEmpty(l.DetectedProblem)).Take(10).ToList();
                if (problemLogs.Any())
                {
                    contextBuilder.AppendLine("Problemas e incidentes detectados en las observaciones:");
                    foreach (var log in problemLogs)
                    {
                        contextBuilder.AppendLine($"- En Tarea #{log.TestTaskId}: {log.DetectedProblem} (Severidad: {log.Severity}) | Comentario: {log.Comments}");
                        if (!string.IsNullOrEmpty(log.ProposedImprovement))
                            contextBuilder.AppendLine($"  Propuesta de mejora del observador: {log.ProposedImprovement}");
                    }
                }
            }

            if (findings.Any())
            {
                contextBuilder.AppendLine("\n--- SÍNTESIS DE HALLAZGOS Y ACCIONES DE MEJORA ---");
                foreach (var f in findings)
                {
                    contextBuilder.AppendLine($"- Hallazgo ({f.Severity}): {f.Description}");
                    contextBuilder.AppendLine($"  Recomendación: {f.Recommendation}");
                    contextBuilder.AppendLine($"  Herramienta de origen: {f.Tool}");
                    if (f.ImprovementActions != null && f.ImprovementActions.Any())
                    {
                        contextBuilder.AppendLine("  Acciones de Mejora asociadas:");
                        foreach (var a in f.ImprovementActions)
                        {
                            contextBuilder.AppendLine($"    * Accion ({a.Priority}): {a.Description}");
                        }
                    }
                }
            }

            // Prompt final
            var prompt = $@"
Eres un Scrum Master e Ingeniero de Software experto. Analiza el siguiente resumen de un proceso de pruebas de usabilidad e IHC (Interacción Humano-Computador) y genera un borrador detallado del **Sprint Backlog** para el equipo de desarrollo que implementará las correcciones.

DATOS DEL PROYECTO Y PRUEBAS:
{contextBuilder}

INSTRUCCIONES DE GENERACIÓN:
Genera un Sprint Backlog coherente que se enfoque en corregir los fallos críticos de usabilidad detectados en las observaciones y hallazgos.
Debes retornar estrictamente un objeto JSON válido con la estructura especificada a continuación.
Por favor, asegúrate de que:
1. Las historias de usuario sigan el formato estándar de scrum: ""Como [perfil de usuario] quiero [funcionalidad] para [beneficio/propósito]"" adaptado al perfil registrado.
2. Cada historia de usuario debe tener criterios de aceptación detallados y un conjunto de tareas técnicas específicas necesarias para su desarrollo.
3. Asigna prioridades (Alta, Media, Baja) basadas en la severidad de los hallazgos y problemas (ej. problemas críticos tienen prioridad Alta).
4. Estima las horas de las tareas técnicas de forma realista (usualmente de 2 a 12 horas).
5. No incluyas explicaciones adicionales antes o después del JSON. Devuelve únicamente el JSON crudo.

ESTRUCTURA JSON REQUERIDA:
{{
  ""sprintName"": ""Sprint 1 - [Nombre descriptivo del Sprint, ej. Optimización de Usabilidad y Flujo de Navegación]"",
  ""sprintGoal"": ""[Meta detallada y motivadora del sprint, ej. Solucionar el 100% de los bloqueos en el inicio de sesión y mejorar los tiempos de respuesta del checkout]"",
  ""userStories"": [
    {{
      ""id"": ""US-1"",
      ""title"": ""[Título corto de la historia]"",
      ""description"": ""Como... quiero... para..."",
      ""priority"": ""Alta"",
      ""acceptanceCriteria"": [
        ""Criterio de aceptación 1"",
        ""Criterio de aceptación 2""
      ],
      ""technicalTasks"": [
        {{
          ""id"": ""TA-1.1"",
          ""title"": ""[Descripción corta de la tarea técnica]"",
          ""estimatedHours"": 4
        }},
        {{
          ""id"": ""TA-1.2"",
          ""title"": ""[Otra tarea técnica]"",
          ""estimatedHours"": 6
        }}
      ]
    }}
  ]
}}
";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    responseMimeType = "application/json"
                }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";
            var httpContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, httpContent);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            var jsonDoc = JsonDocument.Parse(responseBody);
            
            // Extraer el texto generado por Gemini
            var rawText = jsonDoc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrEmpty(rawText))
                throw new Exception("El modelo de IA devolvió una respuesta vacía.");

            // Limpieza del formato del texto (algunas veces el modelo envuelve la respuesta en ```json ... ``` a pesar del config)
            rawText = CleanJsonString(rawText);

            // Validar que sea un JSON compatible
            var backlogData = JsonSerializer.Deserialize<SprintBacklogDataModel>(rawText, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (backlogData == null)
                throw new Exception("Error al deserializar el Sprint Backlog generado.");

            // Generar Markdown a partir de los datos
            var markdown = GenerateMarkdown(backlogData);

            return new SprintBacklogDto
            {
                Id = Guid.NewGuid(),
                TestPlanId = plan.Id,
                SprintName = backlogData.SprintName,
                SprintGoal = backlogData.SprintGoal,
                ContentJson = rawText,
                RawMarkdown = markdown
            };
        }

        private SprintBacklogDto GenerateHeuristically(
            TestPlan plan,
            ModeratorScript? script,
            List<TestSession> sessions,
            List<Finding> findings)
        {
            var backlogData = new SprintBacklogDataModel();
            backlogData.SprintName = "Sprint 1 - Optimización y Corrección de Usabilidad";
            backlogData.SprintGoal = $"Resolver los problemas de usabilidad e IHC identificados en el módulo '{plan.EvaluatedModule}' para mejorar la experiencia de usuario y la tasa de conversión.";

            var userStories = new List<UserStoryModel>();
            var userProfile = string.IsNullOrEmpty(plan.UserProfile) ? "Usuario" : plan.UserProfile;

            // Caso A: Tenemos hallazgos registrados
            if (findings.Any())
            {
                int storyIndex = 1;
                foreach (var finding in findings.OrderByDescending(f => f.Severity))
                {
                    var story = new UserStoryModel
                    {
                        Id = $"US-{storyIndex++}",
                        Title = $"Corregir: {TruncateString(finding.Description, 50)}",
                        Description = $"Como {userProfile}, quiero que el módulo '{plan.EvaluatedModule}' resuelva el problema de '{finding.Description}', para completar mi flujo de tareas con mayor satisfacción y sin errores.",
                        Priority = MapPriority(finding.Priority),
                        AcceptanceCriteria = new List<string>
                        {
                            $"El usuario debe ser capaz de completar la tarea sin experimentar la fricción de: {finding.Description}",
                            $"Se deben aplicar las recomendaciones de diseño y IHC sugeridas: {finding.Recommendation}",
                            "El flujo de interacción debe estar libre de errores técnicos y bloqueos visuales."
                        },
                        TechnicalTasks = new List<TechnicalTaskModel>()
                    };

                    int taskIndex = 1;
                    if (finding.ImprovementActions != null && finding.ImprovementActions.Any())
                    {
                        foreach (var action in finding.ImprovementActions)
                        {
                            story.TechnicalTasks.Add(new TechnicalTaskModel
                            {
                                Id = $"{story.Id}.{taskIndex++}",
                                Title = action.Description,
                                EstimatedHours = MapActionEstimate(action.Priority)
                            });
                        }
                    }
                    else
                    {
                        // Agregar tareas técnicas predeterminadas si no hay acciones de mejora escritas
                        story.TechnicalTasks.Add(new TechnicalTaskModel
                        {
                            Id = $"{story.Id}.1",
                            Title = $"Rediseñar interfaz de usuario siguiendo principios de IHC ({finding.Category ?? "UI"})",
                            EstimatedHours = 4
                        });
                        story.TechnicalTasks.Add(new TechnicalTaskModel
                        {
                            Id = $"{story.Id}.2",
                            Title = $"Implementar correcciones de backend y frontend para mitigar: {TruncateString(finding.Description, 40)}",
                            EstimatedHours = 8
                        });
                    }

                    userStories.Add(story);
                }
            }
            // Caso B: No hay hallazgos, pero tenemos tareas de prueba definidas
            else if (plan.Tasks != null && plan.Tasks.Any())
            {
                int storyIndex = 1;
                foreach (var task in plan.Tasks.OrderBy(t => t.TaskNumber))
                {
                    var story = new UserStoryModel
                    {
                        Id = $"US-{storyIndex++}",
                        Title = $"Flujo Interactivo: {TruncateString(task.Scenario, 50)}",
                        Description = $"Como {userProfile}, quiero poder completar el escenario de '{task.Scenario}', para obtener el resultado esperado: '{task.ExpectedResult}'.",
                        Priority = "Media",
                        AcceptanceCriteria = new List<string>
                        {
                            $"El flujo debe guiar de manera intuitiva al usuario a obtener: {task.ExpectedResult}",
                            $"Debe cumplirse la métrica de éxito: {task.MainMetric}",
                            $"El usuario debe completar la tarea en un tiempo no mayor a {task.MaxTimeSeconds} segundos sin bloqueos."
                        },
                        TechnicalTasks = new List<TechnicalTaskModel>
                        {
                            new TechnicalTaskModel { Id = $"US-{storyIndex-1}.1", Title = "Diseñar maqueta y prototipo interactivo del flujo", EstimatedHours = 4 },
                            new TechnicalTaskModel { Id = $"US-{storyIndex-1}.2", Title = "Desarrollar componentes interactivos en frontend", EstimatedHours = 6 },
                            new TechnicalTaskModel { Id = $"US-{storyIndex-1}.3", Title = "Configurar validación e integración en backend", EstimatedHours = 6 }
                        }
                    };

                    userStories.Add(story);
                }
            }
            // Caso C: Plan vacío
            else
            {
                userStories.Add(new UserStoryModel
                {
                    Id = "US-1",
                    Title = "Optimización General de Usabilidad",
                    Description = $"Como {userProfile}, quiero una interfaz optimizada basada en heurísticas de usabilidad en el módulo '{plan.EvaluatedModule}', para interactuar de forma ágil y satisfactoria.",
                    Priority = "Media",
                    AcceptanceCriteria = new List<string> { "La interfaz debe cumplir las heurísticas de usabilidad de Nielsen.", "Debe cargarse en menos de 2 segundos en escritorio y móviles." },
                    TechnicalTasks = new List<TechnicalTaskModel>
                    {
                        new TechnicalTaskModel { Id = "US-1.1", Title = "Realizar auditoría heurística preliminar", EstimatedHours = 4 },
                        new TechnicalTaskModel { Id = "US-1.2", Title = "Aplicar mejoras de contraste y tamaño de fuentes", EstimatedHours = 4 }
                    }
                });
            }

            backlogData.UserStories = userStories;
            
            var contentJson = JsonSerializer.Serialize(backlogData);
            var markdown = GenerateMarkdown(backlogData);

            return new SprintBacklogDto
            {
                Id = Guid.NewGuid(),
                TestPlanId = plan.Id,
                SprintName = backlogData.SprintName,
                SprintGoal = backlogData.SprintGoal,
                ContentJson = contentJson,
                RawMarkdown = markdown
            };
        }

        private static string CleanJsonString(string raw)
        {
            raw = raw.Trim();
            if (raw.StartsWith("```"))
            {
                // Quitar marcador de inicio ```json o ```
                int index = raw.IndexOf('\n');
                if (index != -1)
                {
                    raw = raw.Substring(index + 1);
                }
                else
                {
                    raw = raw.Substring(3);
                }

                // Quitar marcador de fin ```
                if (raw.EndsWith("```"))
                {
                    raw = raw.Substring(0, raw.Length - 3);
                }
            }
            return raw.Trim();
        }

        private static string GenerateMarkdown(SprintBacklogDataModel model)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"# Sprint Backlog: {model.SprintName}");
            sb.AppendLine();
            sb.AppendLine($"**Meta del Sprint (Sprint Goal):**");
            sb.AppendLine($"> {model.SprintGoal}");
            sb.AppendLine();
            sb.AppendLine("---");
            sb.AppendLine();
            sb.AppendLine("## Historias de Usuario e Incremento del Product Backlog");
            sb.AppendLine();

            foreach (var us in model.UserStories)
            {
                sb.AppendLine($"### 📋 [{us.Id}] {us.Title}");
                sb.AppendLine();
                sb.AppendLine($"**Descripción:**");
                sb.AppendLine($"`{us.Description}`");
                sb.AppendLine();
                sb.AppendLine($"* **Prioridad:** {us.Priority}");
                sb.AppendLine();
                
                sb.AppendLine("**Criterios de Aceptación:**");
                foreach (var ac in us.AcceptanceCriteria)
                {
                    sb.AppendLine($"- [ ] {ac}");
                }
                sb.AppendLine();

                sb.AppendLine("**Tareas Técnicas y Estimaciones:**");
                sb.AppendLine("| ID Tarea | Descripción de la Tarea Técnica | Esfuerzo Estimado |");
                sb.AppendLine("| :--- | :--- | :--- |");
                foreach (var task in us.TechnicalTasks)
                {
                    sb.AppendLine($"| {task.Id} | {task.Title} | {task.EstimatedHours} horas |");
                }
                sb.AppendLine();
                sb.AppendLine("---");
                sb.AppendLine();
            }

            return sb.ToString();
        }

        private static string TruncateString(string input, int maxLength)
        {
            if (string.IsNullOrEmpty(input)) return string.Empty;
            return input.Length <= maxLength ? input : input.Substring(0, maxLength) + "...";
        }

        private static string MapPriority(PriorityLevel priority)
        {
            return priority switch
            {
                PriorityLevel.High => "Alta",
                PriorityLevel.Medium => "Media",
                _ => "Baja"
            };
        }

        private static int MapActionEstimate(PriorityLevel priority)
        {
            return priority switch
            {
                PriorityLevel.High => 8,
                PriorityLevel.Medium => 6,
                _ => 4
            };
        }

        private SprintBacklogDto MapToDto(SprintBacklog backlog)
        {
            return new SprintBacklogDto
            {
                Id = backlog.Id,
                TestPlanId = backlog.TestPlanId,
                SprintName = backlog.SprintName,
                SprintGoal = backlog.SprintGoal,
                ContentJson = backlog.ContentJson,
                RawMarkdown = backlog.RawMarkdown,
                CreatedAt = backlog.CreatedAt,
                UpdatedAt = backlog.UpdatedAt
            };
        }

        // --- Modelos Auxiliares para Deserialización ---
        private class SprintBacklogDataModel
        {
            public string SprintName { get; set; } = string.Empty;
            public string SprintGoal { get; set; } = string.Empty;
            public List<UserStoryModel> UserStories { get; set; } = new List<UserStoryModel>();
        }

        private class UserStoryModel
        {
            public string Id { get; set; } = string.Empty;
            public string Title { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string Priority { get; set; } = string.Empty;
            public List<string> AcceptanceCriteria { get; set; } = new List<string>();
            public List<TechnicalTaskModel> TechnicalTasks { get; set; } = new List<TechnicalTaskModel>();
        }

        private class TechnicalTaskModel
        {
            public string Id { get; set; } = string.Empty;
            public string Title { get; set; } = string.Empty;
            public int EstimatedHours { get; set; }
        }
    }
}
