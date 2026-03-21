using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IModeratorScriptService
    {
        Task<ModeratorScriptDto?> GetByPlanIdAsync(Guid testPlanId);
        Task<ModeratorScriptDto?> GetByIdAsync(Guid id);
        Task<ModeratorScriptDto> CreateAsync(CreateModeratorScriptDto dto);
        Task<ModeratorScriptDto> UpdateAsync(Guid id, UpdateModeratorScriptDto dto);
        Task DeleteAsync(Guid id);
    }
}
