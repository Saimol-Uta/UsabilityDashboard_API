using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace UsabilityDashboard_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SprintBacklogController : ControllerBase
    {
        private readonly ISprintBacklogService _service;

        public SprintBacklogController(ISprintBacklogService service)
        {
            _service = service;
        }

        [HttpGet("by-plan/{planId:guid}")]
        public async Task<IActionResult> GetByPlan(Guid planId)
        {
            var backlog = await _service.GetByPlanIdAsync(planId);
            if (backlog == null) return NotFound();
            return Ok(backlog);
        }

        [HttpPost("generate")]
        public async Task<IActionResult> Generate([FromBody] GenerateBacklogRequestDto dto)
        {
            try
            {
                var backlog = await _service.GenerateAsync(dto.TestPlanId, dto.UserApiKey);
                return Ok(backlog);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al generar el backlog: {ex.Message}");
            }
        }

        [HttpPost("save/{planId:guid}")]
        public async Task<IActionResult> Save(Guid planId, [FromBody] SaveSprintBacklogDto dto)
        {
            try
            {
                var saved = await _service.SaveAsync(planId, dto);
                return Ok(saved);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al guardar el backlog: {ex.Message}");
            }
        }
    }
}
