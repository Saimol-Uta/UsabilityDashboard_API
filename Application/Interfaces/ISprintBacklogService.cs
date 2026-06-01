using Application.DTOs;
using System;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface ISprintBacklogService
    {
        Task<SprintBacklogDto?> GetByPlanIdAsync(Guid planId);
        Task<SprintBacklogDto> GenerateAsync(Guid planId, string? userApiKey);
        Task<SprintBacklogDto> SaveAsync(Guid planId, SaveSprintBacklogDto dto);
        Task<string> ChatAsync(string prompt, string activePageName, string contextJson);
    }
}
