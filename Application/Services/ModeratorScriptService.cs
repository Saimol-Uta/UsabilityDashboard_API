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
    public class ModeratorScriptService : IModeratorScriptService
    {
        private readonly IRepository<ModeratorScript> _repository;
        private readonly IMapper _mapper;

        public ModeratorScriptService(IRepository<ModeratorScript> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<ModeratorScriptDto?> GetByPlanIdAsync(Guid testPlanId)
        {
            var scripts = await _repository.GetAllAsync();
            var script = scripts.FirstOrDefault(s => s.TestPlanId == testPlanId);
            return script is null ? null : _mapper.Map<ModeratorScriptDto>(script);
        }

        public async Task<ModeratorScriptDto?> GetByIdAsync(Guid id)
        {
            var script = await _repository.GetByIdAsync(id);
            return script is null ? null : _mapper.Map<ModeratorScriptDto>(script);
        }

        public async Task<ModeratorScriptDto> CreateAsync(CreateModeratorScriptDto dto)
        {
            var script = _mapper.Map<ModeratorScript>(dto);
            var created = await _repository.AddAsync(script);
            return _mapper.Map<ModeratorScriptDto>(created);
        }

        public async Task<ModeratorScriptDto> UpdateAsync(Guid id, UpdateModeratorScriptDto dto)
        {
            var script = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"ModeratorScript {id} not found");

            _mapper.Map(dto, script);
            script.UpdatedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(script);
            return _mapper.Map<ModeratorScriptDto>(script);
        }

        public async Task DeleteAsync(Guid id)
        {
            var script = await _repository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"ModeratorScript {id} not found");

            await _repository.DeleteAsync(script.Id);
        }
    }
}
