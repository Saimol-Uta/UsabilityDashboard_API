using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace UsabilityDashboard_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FindingsController : ControllerBase
    {
        private readonly IFindingService _service;

        public FindingsController(IFindingService service)
        {
            _service = service;
        }

        [HttpGet("by-plan/{planId:guid}")]
        public async Task<IActionResult> GetByPlan(Guid planId)
        {
            var findings = await _service.GetByPlanIdAsync(planId);
            return Ok(findings);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var finding = await _service.GetByIdAsync(id);
            return finding is null ? NotFound() : Ok(finding);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateFindingDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFindingDto dto)
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
