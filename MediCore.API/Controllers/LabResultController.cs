using MediCore.Business.DTOs.LabResult;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LabResultController : ControllerBase
    {
        readonly ILabResultService _labResultService;

        public LabResultController(ILabResultService labResultService)
        {
            _labResultService = labResultService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _labResultService.GetByIdAsync(id));
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _labResultService.GetAllAsync());
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Doctor")]
        public async Task<IActionResult> Create([FromBody] CreateLabResultDto dto)
        {
            await _labResultService.CreateAsync(dto);
            Hangfire.BackgroundJob.Enqueue(() => Console.WriteLine($"Sistem Mesajı: {DateTime.UtcNow} - Yeni laboratoriya analizi uğurla yaradıldı!"));
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpPut]
        [Authorize(Roles = "Admin, Doctor")]
        public async Task<IActionResult> Update([FromBody] UpdateLabResultDto dto)
        {
            await _labResultService.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("SoftDelete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            await _labResultService.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpPut("Restore/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Restore(int id)
        {
            await _labResultService.RestoreAsync(id);
            return Ok(new { message = "Analiz nəticəsi arxivdən uğurla bərpa edildi!" });
        }
    }
}
