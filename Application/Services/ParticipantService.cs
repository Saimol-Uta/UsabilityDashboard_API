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
    public class ParticipantService : IParticipantService
    {
        private readonly IRepository<Participant> _repository;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateParticipantDto> _validator;

        public ParticipantService(
            IRepository<Participant> repository,
            IMapper mapper,
            IValidator<CreateParticipantDto> validator)
        {
            _repository = repository;
            _mapper = mapper;
            _validator = validator;
        }

        public async Task<IEnumerable<ParticipantDto>> GetAllAsync()
            {
                var participants = await _repository.GetAllAsync();
                return _mapper.Map<IEnumerable<ParticipantDto>>(participants);
            }

            public async Task<ParticipantDto?> GetByIdAsync(Guid id)
            {
                var participant = await _repository.GetByIdAsync(id);
                return participant is null ? null : _mapper.Map<ParticipantDto>(participant);
            }

            public async Task<ParticipantDto> CreateAsync(CreateParticipantDto dto)
            {
                var participant = _mapper.Map<Participant>(dto);
                var created = await _repository.AddAsync(participant);
                return _mapper.Map<ParticipantDto>(created);
            }

            public async Task<ParticipantDto> UpdateAsync(Guid id, UpdateParticipantDto dto)
            {
                var participant = await _repository.GetByIdAsync(id)
                    ?? throw new KeyNotFoundException($"Participant {id} not found");

                _mapper.Map(dto, participant);
                participant.UpdatedAt = DateTime.UtcNow;
                await _repository.UpdateAsync(participant);
                return _mapper.Map<ParticipantDto>(participant);
            }

            public async Task DeleteAsync(Guid id)
            {
                var participant = await _repository.GetByIdAsync(id)
                    ?? throw new KeyNotFoundException($"Participant {id} not found");

                await _repository.DeleteAsync(participant.Id);
            }
        }
    
}
