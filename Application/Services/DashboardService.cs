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
        private readonly IRepository<ObservationLog> _logRepository;
        private readonly IRepository<Finding> _findingRepository;
        private readonly IRepository<ImprovementAction> _actionRepository;

        public DashboardService(
            IRepository<ObservationLog> logRepository,
            IRepository<Finding> findingRepository,
            IRepository<ImprovementAction> actionRepository)
        {
            _logRepository = logRepository;
            _findingRepository = findingRepository;
            _actionRepository = actionRepository;
        }

        public async Task<DashboardStatsDto> GetStatsAsync(Guid? testPlanId)
        {
            var logs = (await _logRepository.GetAllAsync()).ToList();
            var findings = (await _findingRepository.GetAllAsync()).ToList();
            var actions = (await _actionRepository.GetAllAsync()).ToList();

            // Filtro opcional por plan
            if (testPlanId.HasValue)
            {
                findings = findings.Where(f => f.TestPlanId == testPlanId.Value).ToList();
                // ObservationLog no tiene TestPlanId directo — filtro por sesión queda para v2
            }

            var totalLogs = logs.Count;
            var successLogs = logs.Count(l => l.TaskSuccess);
            var avgTime = totalLogs > 0 ? logs.Average(l => (double)l.TimeSeconds) : 0;
            var totalErrors = logs.Sum(l => l.ErrorCount);

            var errorsBySeverity = logs
                .GroupBy(l => l.Severity.ToString())
                .Select(g => new ErrorsBySeverityDto(g.Key, g.Sum(l => l.ErrorCount)));

            var successByTask = logs
                .GroupBy(l => l.TestTaskId)
                .Select(g => new SuccessByTaskDto(
                    g.Key,
                    g.Count(),
                    g.Count(l => l.TaskSuccess),
                    g.Average(l => (double)l.TimeSeconds)));

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
                SuccessByTask: successByTask
            );
        }
    }
}
