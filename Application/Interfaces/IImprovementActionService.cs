using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IImprovementActionService
    {
        Task<IEnumerable<ImprovementActionDto>> GetByFindingIdAsync(Guid findingId);
        Task<ImprovementActionDto?> GetByIdAsync(Guid id);
        Task<ImprovementActionDto> CreateAsync(CreateImprovementActionDto dto);
        Task<ImprovementActionDto> UpdateAsync(Guid id, UpdateImprovementActionDto dto);
        Task UpdateStatusAsync(Guid id, string status);
        Task DeleteAsync(Guid id);
    }
}
