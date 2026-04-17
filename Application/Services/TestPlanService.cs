using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Common;
using Domain.Entities;
using Domain.Interfaces;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services
{
    public class TestPlanService : ITestPlanService
    {
        private readonly IRepository<TestPlan> _repository;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateTestPlanDto> _validator;

        public TestPlanService(
            IRepository<TestPlan> repository,
            IMapper mapper,
            IValidator<CreateTestPlanDto> validator)
        {
            _repository = repository;
            _mapper = mapper;
            _validator = validator;
        }


        public async Task<IEnumerable<TestPlanDto>> GetAllAsync()
        {
            var plans = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<TestPlanDto>>(plans);
        }

        public async Task<TestPlanDto?> GetByIdAsync(Guid id)
        {
            var plan = await _repository.GetByIdWithIncludesAsync(
                id,
                x => x.Tasks,
                x => x.Findings,
                x => x.Sessions,
                x => x.ModeratorScript
            );

            return plan is null ? null : _mapper.Map<TestPlanDto>(plan);
        }

        public async Task<TestPlanDto> CreateAsync(CreateTestPlanDto dto)
        {
            var result = await _validator.ValidateAsync(dto);
            if (!result.IsValid)
                throw new ValidationException(result.Errors);

            var plan = _mapper.Map<TestPlan>(dto);
            var created = await _repository.AddAsync(plan);
            return _mapper.Map<TestPlanDto>(created);
        }

        public async Task<TestPlanDto> UpdateAsync(Guid id, UpdateTestPlanDto dto)
        {
            var plan = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"TestPlan {id} not found");

            var oldState = plan.WorkflowState;
            _mapper.Map(dto, plan);
            plan.UpdatedAt = DateTime.UtcNow;

            if (dto.WorkflowState == null)
            {
                plan.WorkflowState = oldState; // prevent overwriting with null
            }

            if (Enum.TryParse<TestPlanStatus>(dto.Status, ignoreCase: true, out var status))
                plan.Status = status;

            await _repository.UpdateAsync(plan);
            return _mapper.Map<TestPlanDto>(plan);
        }

        public async Task<TestPlanDto> UpdateStatusAsync(Guid id, string status)
        {
            var plan = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"TestPlan {id} not found");

            if (Enum.TryParse<TestPlanStatus>(status, ignoreCase: true, out var newStatus))
            {
                plan.Status = newStatus;
                plan.UpdatedAt = DateTime.UtcNow;
                await _repository.UpdateAsync(plan);
                return _mapper.Map<TestPlanDto>(plan);
            }
            throw new ArgumentException($"Invalid status: {status}");
        }

        public async Task DeleteAsync(Guid id)
        {
            var plan = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"TestPlan {id} not found");

            await _repository.DeleteAsync(plan.Id);
        }
    }
}
