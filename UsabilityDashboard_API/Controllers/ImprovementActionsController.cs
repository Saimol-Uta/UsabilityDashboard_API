using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace UsabilityDashboard_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImprovementActionsController : ControllerBase
    {
        private readonly IImprovementActionService _service;

        public ImprovementActionsController(IImprovementActionService service)
        {
            _service = service;
        }

        [HttpGet("by-finding/{findingId:guid}")]
        public async Task<IActionResult> GetByFinding(Guid findingId)
        {
            var actions = await _service.GetByFindingIdAsync(findingId);
            return Ok(actions);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var action = await _service.GetByIdAsync(id);
            return action is null ? NotFound() : Ok(action);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateImprovementActionDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateImprovementActionDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            return Ok(updated);
        }

        // PATCH heredado del prototipo — muy útil para el dashboard
        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusDto dto)
        {
            await _service.UpdateStatusAsync(id, dto.Status);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
