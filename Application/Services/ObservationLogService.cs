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
    public class ObservationLogService : IObservationLogService
    {
        private readonly IRepository<ObservationLog> _repository;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateObservationLogDto> _validator;

        public ObservationLogService(
            IRepository<ObservationLog> repository,
            IMapper mapper,
            IValidator<CreateObservationLogDto> validator)
        {
            _repository = repository;
            _mapper = mapper;
            _validator = validator;
        }


        public ObservationLogService(IRepository<ObservationLog> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ObservationLogDto>> GetAllAsync(Guid? testSessionId, Guid? testTaskId)
        {
            var logs = await _repository.GetAllAsync();

            if (testSessionId.HasValue)
                logs = logs.Where(l => l.TestSessionId == testSessionId.Value);

            if (testTaskId.HasValue)
                logs = logs.Where(l => l.TestTaskId == testTaskId.Value);

            return _mapper.Map<IEnumerable<ObservationLogDto>>(logs);
        }

        public async Task<ObservationLogDto?> GetByIdAsync(Guid id)
        {
            var log = await _repository.GetByIdAsync(id);
            return log is null ? null : _mapper.Map<ObservationLogDto>(log);
        }

        public async Task<ObservationLogDto> CreateAsync(CreateObservationLogDto dto)
        {
            var log = _mapper.Map<ObservationLog>(dto);
            var created = await _repository.AddAsync(log);
            return _mapper.Map<ObservationLogDto>(created);
        }

        public async Task<ObservationLogDto> UpdateAsync(Guid id, UpdateObservationLogDto dto)
        {
            var log = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"ObservationLog {id} not found");

            _mapper.Map(dto, log);
            log.UpdatedAt = DateTime.UtcNow;

            if (Enum.TryParse<SeverityLevel>(dto.Severity, ignoreCase: true, out var severity))
                log.Severity = severity;

            await _repository.UpdateAsync(log);
            return _mapper.Map<ObservationLogDto>(log);
        }

        public async Task DeleteAsync(Guid id)
        {
            var log = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"ObservationLog {id} not found");

            await _repository.DeleteAsync(log.Id);
        }
    }
}
