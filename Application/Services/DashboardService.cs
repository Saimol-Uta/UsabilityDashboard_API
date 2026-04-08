using Application.DTOs;
using Application.Interfaces;
using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IRepository<TestSession> _sessionRepository;
        private readonly IRepository<Finding> _findingRepository;
        private readonly IRepository<ImprovementAction> _actionRepository;

        public DashboardService(
            IRepository<TestSession> sessionRepository,
            IRepository<Finding> findingRepository,
            IRepository<ImprovementAction> actionRepository)
        {
            _sessionRepository = sessionRepository;
            _findingRepository = findingRepository;
            _actionRepository = actionRepository;
        }

        public async Task<DashboardStatsDto> GetStatsAsync(Guid? testPlanId)
        {
            // Traer sesiones con sus observaciones y participantes
            var sessions = (await _sessionRepository.GetAllWithIncludesAsync(
                x => x.ObservationLogs,
                x => x.Participant
            )).ToList();

            var findings = (await _findingRepository.GetAllAsync()).ToList();
            var actions = (await _actionRepository.GetAllAsync()).ToList();

            // Filtrar por plan si se especifica
            if (testPlanId.HasValue)
            {
                sessions = sessions.Where(s => s.TestPlanId == testPlanId.Value).ToList();
                findings = findings.Where(f => f.TestPlanId == testPlanId.Value).ToList();

                // Actions belong to findings, not directly to plans — filter via finding IDs
                var planFindingIds = findings.Select(f => f.Id).ToHashSet();
                actions = actions.Where(a => planFindingIds.Contains(a.FindingId)).ToList();
            }

            // Aplanar todas las observaciones de todas las sesiones
            var logs = sessions.SelectMany(s => s.ObservationLogs).ToList();

            var totalLogs = logs.Count;
            var successLogs = logs.Count(l => l.TaskSuccess);
            var avgTime = totalLogs > 0 ? logs.Average(l => (double)l.TimeSeconds) : 0;
            var totalErrors = logs.Sum(l => l.ErrorCount);

            // Agrupar por severidad
            var errorsBySeverity = logs
                .GroupBy(l => l.Severity.ToString())
                .Select(g => new ErrorsBySeverityDto(g.Key, g.Sum(l => l.ErrorCount)));

            // Agrupar por tarea
            var successByTask = logs
                .GroupBy(l => l.TestTaskId)
                .Select(g => new SuccessByTaskDto(
                    g.Key,
                    g.Count(),
                    g.Count(l => l.TaskSuccess),
                    g.Average(l => (double)l.TimeSeconds)));

            // Nueva métrica — comparar plataformas
            var statsByPlatform = sessions
                .GroupBy(s => s.PlatformTested)
                .Select(g => new PlatformStatsDto(
                    g.Key,
                    g.SelectMany(s => s.ObservationLogs).Count(),
                    g.SelectMany(s => s.ObservationLogs).Count(l => l.TaskSuccess),
                    g.SelectMany(s => s.ObservationLogs).Any()
                        ? g.SelectMany(s => s.ObservationLogs).Average(l => (double)l.TimeSeconds)
                        : 0
                ));

            return new DashboardStatsDto(
                TotalObservations: totalLogs,
                SuccessRate: totalLogs > 0 ? Math.Round((double)successLogs / totalLogs * 100, 1) : 0,
                AverageTimeSeconds: Math.Round(avgTime, 1),
                TotalErrors: totalErrors,
                TotalFindings: findings.Count,
                CriticalFindings: findings.Count(f => f.Severity == SeverityLevel.Critical),
                ModerateFindings: findings.Count(f => f.Severity == SeverityLevel.Medium),
                TotalActions: actions.Count,
                CompletedActions: actions.Count(a => a.Status == ActionStatus.Resolved),
                PendingActions: actions.Count(a => a.Status == ActionStatus.Open),
                InProgressActions: actions.Count(a => a.Status == ActionStatus.InProgress),
                ErrorsBySeverity: errorsBySeverity,
                SuccessByTask: successByTask,
                StatsByPlatform: statsByPlatform  
            );
        }
    }
}
