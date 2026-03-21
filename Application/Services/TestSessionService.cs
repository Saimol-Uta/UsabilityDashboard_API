using Application.DTOs;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services
{
    public class TestSessionService : ITestSessionService
    {
        private readonly IRepository<TestSession> _repository;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateTestSessionDto> _validator;

        public TestSessionService(
            IRepository<TestSession> repository,
            IMapper mapper,
            IValidator<CreateTestSessionDto> validator)
        {
            _repository = repository;
            _mapper = mapper;
            _validator = validator;
        }

        public async Task<IEnumerable<TestSessionDto>> GetAllAsync(Guid? testPlanId)
        {
            var sessions = await _repository.GetAllWithIncludesAsync(
                x => x.Participant,
                x => x.TestPlan
            );

            if (testPlanId.HasValue)
                sessions = sessions.Where(s => s.TestPlanId == testPlanId.Value);

            return _mapper.Map<IEnumerable<TestSessionDto>>(sessions);
        }

        public async Task<TestSessionDto?> GetByIdAsync(Guid id)
        {
            var session = await _repository.GetByIdWithIncludesAsync(
                id,
                x => x.Participant,
                x => x.TestPlan
            );

            return session is null ? null : _mapper.Map<TestSessionDto>(session);
        }

        public async Task<TestSessionDto> CreateAsync(CreateTestSessionDto dto)
        {
            var result = await _validator.ValidateAsync(dto);
            if (!result.IsValid)
                throw new ValidationException(result.Errors);

            var session = _mapper.Map<TestSession>(dto);
            var created = await _repository.AddAsync(session);

            return await GetByIdAsync(created.Id)
                ?? _mapper.Map<TestSessionDto>(created);
        }

        public async Task<TestSessionDto> UpdateAsync(Guid id, UpdateTestSessionDto dto)
        {
            var session = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"TestSession {id} not found");

            _mapper.Map(dto, session);
            await _repository.UpdateAsync(session);

            return await GetByIdAsync(id)
                ?? _mapper.Map<TestSessionDto>(session);
        }

        public async Task DeleteAsync(Guid id)
        {
            var session = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"TestSession {id} not found");

            await _repository.DeleteAsync(session.Id);
        }
    }
}
