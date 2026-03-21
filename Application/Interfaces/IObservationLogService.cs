using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface IObservationLogService
    {
        Task<IEnumerable<ObservationLogDto>> GetAllAsync(Guid? testSessionId, Guid? testTaskId);
        Task<ObservationLogDto?> GetByIdAsync(Guid id);
        Task<ObservationLogDto> CreateAsync(CreateObservationLogDto dto);
        Task<ObservationLogDto> UpdateAsync(Guid id, UpdateObservationLogDto dto);
        Task DeleteAsync(Guid id);
    }
}
