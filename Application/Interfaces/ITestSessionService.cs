using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface ITestSessionService
    {
        Task<IEnumerable<TestSessionDto>> GetAllAsync(Guid? testPlanId);
        Task<TestSessionDto?> GetByIdAsync(Guid id);
        Task<TestSessionDto> CreateAsync(CreateTestSessionDto dto);
        Task<TestSessionDto> UpdateAsync(Guid id, UpdateTestSessionDto dto);
        Task DeleteAsync(Guid id);
    }
}
