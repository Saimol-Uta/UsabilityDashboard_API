using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services
{
    public class TestTaskService : ITestTaskService
    {
        private readonly IRepository<TestTask> _repository;
        private readonly IMapper _mapper;

        public TestTaskService(IRepository<TestTask> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TestTaskDto>> GetByPlanIdAsync(Guid testPlanId)
        {
            var tasks = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<TestTaskDto>>(
                tasks.Where(t => t.TestPlanId == testPlanId));
        }

        public async Task<TestTaskDto?> GetByIdAsync(Guid id)
        {
            var task = await _repository.GetByIdAsync(id);
            return task is null ? null : _mapper.Map<TestTaskDto>(task);
        }

        public async Task<TestTaskDto> CreateAsync(CreateTestTaskDto dto)
        {
            var task = _mapper.Map<TestTask>(dto);
            var created = await _repository.AddAsync(task);
            return _mapper.Map<TestTaskDto>(created);
        }

        public async Task<TestTaskDto> UpdateAsync(Guid id, UpdateTestTaskDto dto)
        {
            var task = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"TestTask {id} not found");

            _mapper.Map(dto, task);
            task.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(task);
            return _mapper.Map<TestTaskDto>(task);
        }

        public async Task DeleteAsync(Guid id)
        {
            var task = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"TestTask {id} not found");

            await _repository.DeleteAsync(task.Id);
        }
    }
}
