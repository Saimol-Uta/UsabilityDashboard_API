using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace UsabilityDashboard_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestTasksController : ControllerBase
    {
        private readonly ITestTaskService _service;

        public TestTasksController(ITestTaskService service)
        {
            _service = service;
        }

        [HttpGet("by-plan/{planId:guid}")]
        public async Task<IActionResult> GetByPlan(Guid planId)
        {
            var tasks = await _service.GetByPlanIdAsync(planId);
            return Ok(tasks);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var task = await _service.GetByIdAsync(id);
            return task is null ? NotFound() : Ok(task);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTestTaskDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTestTaskDto dto)
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
