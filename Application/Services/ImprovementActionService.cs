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
    public class ImprovementActionService : IImprovementActionService
    {
        private readonly IRepository<ImprovementAction> _repository;
        private readonly IMapper _mapper;

        public ImprovementActionService(IRepository<ImprovementAction> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ImprovementActionDto>> GetByFindingIdAsync(Guid findingId)
        {
            var actions = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<ImprovementActionDto>>(
                actions.Where(a => a.FindingId == findingId));
        }

        public async Task<ImprovementActionDto?> GetByIdAsync(Guid id)
        {
            var action = await _repository.GetByIdAsync(id);
            return action is null ? null : _mapper.Map<ImprovementActionDto>(action);
        }

        public async Task<ImprovementActionDto> CreateAsync(CreateImprovementActionDto dto)
        {
            var action = _mapper.Map<ImprovementAction>(dto);
            var created = await _repository.AddAsync(action);
            return _mapper.Map<ImprovementActionDto>(created);
        }

        public async Task<ImprovementActionDto> UpdateAsync(Guid id, UpdateImprovementActionDto dto)
        {
            var action = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"ImprovementAction {id} not found");

            _mapper.Map(dto, action);
            action.UpdatedAt = DateTime.UtcNow;

            if (Enum.TryParse<ActionStatus>(dto.Status, ignoreCase: true, out var status))
                action.Status = status;
            if (Enum.TryParse<PriorityLevel>(dto.Priority, ignoreCase: true, out var priority))
                action.Priority = priority;

            await _repository.UpdateAsync(action);
            return _mapper.Map<ImprovementActionDto>(action);
        }

        public async Task UpdateStatusAsync(Guid id, string status)
        {
            var action = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"ImprovementAction {id} not found");

            if (!Enum.TryParse<ActionStatus>(status, ignoreCase: true, out var parsedStatus))
                throw new ArgumentException($"Invalid status: {status}");

            action.Status = parsedStatus;
            action.UpdatedAt = DateTime.UtcNow;

            // Si se marca como completada, registra la fecha
            if (parsedStatus == ActionStatus.Resolved)
                action.ImplementedDate = DateTime.UtcNow;

            await _repository.UpdateAsync(action);
        }

        public async Task DeleteAsync(Guid id)
        {
            var action = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"ImprovementAction {id} not found");

            await _repository.DeleteAsync(action.Id);
        }
    }
}
