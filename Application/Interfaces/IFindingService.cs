using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IFindingService
    {
        Task<IEnumerable<FindingDto>> GetByPlanIdAsync(Guid testPlanId);
        Task<FindingDto?> GetByIdAsync(Guid id);
        Task<FindingDto> CreateAsync(CreateFindingDto dto);
        Task<FindingDto> UpdateAsync(Guid id, UpdateFindingDto dto);
        Task DeleteAsync(Guid id);
    }
}
