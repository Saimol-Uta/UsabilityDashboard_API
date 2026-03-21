using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IParticipantService
    {
        Task<IEnumerable<ParticipantDto>> GetAllAsync();
        Task<ParticipantDto?> GetByIdAsync(Guid id);
        Task<ParticipantDto> CreateAsync(CreateParticipantDto dto);
        Task<ParticipantDto> UpdateAsync(Guid id, UpdateParticipantDto dto);
        Task DeleteAsync(Guid id);
    }
}
