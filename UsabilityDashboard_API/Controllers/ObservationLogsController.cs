using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace UsabilityDashboard_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ObservationLogsController : ControllerBase
    {
        private readonly IObservationLogService _service;

        public ObservationLogsController(IObservationLogService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] Guid? testSessionId,
            [FromQuery] Guid? testTaskId)
        {
            var logs = await _service.GetAllAsync(testSessionId, testTaskId);
            return Ok(logs);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var log = await _service.GetByIdAsync(id);
            return log is null ? NotFound() : Ok(log);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateObservationLogDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateObservationLogDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            return Ok(updated);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
