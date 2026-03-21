using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface ITestTaskService
    {
        Task<IEnumerable<TestTaskDto>> GetByPlanIdAsync(Guid testPlanId);
        Task<TestTaskDto?> GetByIdAsync(Guid id);
        Task<TestTaskDto> CreateAsync(CreateTestTaskDto dto);
        Task<TestTaskDto> UpdateAsync(Guid id, UpdateTestTaskDto dto);
        Task DeleteAsync(Guid id);
    }
}
