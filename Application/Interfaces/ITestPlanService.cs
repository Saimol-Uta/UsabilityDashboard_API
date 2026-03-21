using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface ITestPlanService
    {
        Task<IEnumerable<TestPlanDto>> GetAllAsync();
        Task<TestPlanDto?> GetByIdAsync(Guid id);
        Task<TestPlanDto> CreateAsync(CreateTestPlanDto dto);
        Task<TestPlanDto> UpdateAsync(Guid id, UpdateTestPlanDto dto);
        Task DeleteAsync(Guid id);
    }
}
