using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace UsabilityDashboard_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestPlansController : ControllerBase
    {
        private readonly ITestPlanService _service;

        public TestPlansController(ITestPlanService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var plans = await _service.GetAllAsync();
            return Ok(plans);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var plan = await _service.GetByIdAsync(id);
            return plan is null ? NotFound() : Ok(plan);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTestPlanDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTestPlanDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            return Ok(updated);
        }

        [HttpPatch("{id:guid}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
        {
            try
            {
                var updated = await _service.UpdateStatusAsync(id, status);
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
