using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services
{
    public class TestPlanService : ITestPlanService
    {
        private readonly IRepository<TestPlan> _repository;
        private readonly IMapper _mapper;

        public TestPlanService(IRepository<TestPlan> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TestPlanDto>> GetAllAsync()
        {
            var plans = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<TestPlanDto>>(plans);
        }

        public async Task<TestPlanDto?> GetByIdAsync(Guid id)
        {
            var plan = await _repository.GetByIdAsync(id);
            return plan is null ? null : _mapper.Map<TestPlanDto>(plan);
        }

        public async Task<TestPlanDto> CreateAsync(CreateTestPlanDto dto)
        {
            var plan = _mapper.Map<TestPlan>(dto);
            var created = await _repository.AddAsync(plan);
            return _mapper.Map<TestPlanDto>(created);
        }

        public async Task<TestPlanDto> UpdateAsync(Guid id, UpdateTestPlanDto dto)
        {
            var plan = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"TestPlan {id} not found");

            _mapper.Map(dto, plan);
            plan.UpdatedAt = DateTime.UtcNow;

            if (Enum.TryParse<TestPlanStatus>(dto.Status, ignoreCase: true, out var status))
                plan.Status = status;

            await _repository.UpdateAsync(plan);
            return _mapper.Map<TestPlanDto>(plan);
        }

        public async Task DeleteAsync(Guid id)
        {
            var plan = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"TestPlan {id} not found");

            await _repository.DeleteAsync(plan.Id);
        }
    }
}
