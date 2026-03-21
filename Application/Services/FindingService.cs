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
    public class FindingService : IFindingService
    {
        private readonly IRepository<Finding> _repository;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateFindingDto> _validator;

        public FindingService(
            IRepository<Finding> repository,
            IMapper mapper,
            IValidator<CreateFindingDto> validator)
        {
            _repository = repository;
            _mapper = mapper;
            _validator = validator;
        }

        public async Task<IEnumerable<FindingDto>> GetByPlanIdAsync(Guid testPlanId)
        {
            var findings = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<FindingDto>>(
                findings.Where(f => f.TestPlanId == testPlanId));
        }

        public async Task<FindingDto?> GetByIdAsync(Guid id)
        {
            var finding = await _repository.GetByIdAsync(id);
            return finding is null ? null : _mapper.Map<FindingDto>(finding);
        }

        public async Task<FindingDto> CreateAsync(CreateFindingDto dto)
        {
            var finding = _mapper.Map<Finding>(dto);
            var created = await _repository.AddAsync(finding);
            return _mapper.Map<FindingDto>(created);
        }

        public async Task<FindingDto> UpdateAsync(Guid id, UpdateFindingDto dto)
        {
            var finding = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Finding {id} not found");

            _mapper.Map(dto, finding);
            finding.UpdatedAt = DateTime.UtcNow;

            if (Enum.TryParse<SeverityLevel>(dto.Severity, ignoreCase: true, out var severity))
                finding.Severity = severity;
            if (Enum.TryParse<PriorityLevel>(dto.Priority, ignoreCase: true, out var priority))
                finding.Priority = priority;
            if (Enum.TryParse<ActionStatus>(dto.Status, ignoreCase: true, out var status))
                finding.Status = status;

            await _repository.UpdateAsync(finding);
            return _mapper.Map<FindingDto>(finding);
        }

        public async Task DeleteAsync(Guid id)
        {
            var finding = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Finding {id} not found");

            await _repository.DeleteAsync(finding.Id);
        }
    }
}
