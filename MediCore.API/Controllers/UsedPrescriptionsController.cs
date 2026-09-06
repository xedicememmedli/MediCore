using Hangfire;
using MediCore.Business.DTOs.UsedPrescription;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsedPrescriptionsController : ControllerBase
    {
        private readonly IUsedPrescriptionService _service;

        public UsedPrescriptionsController(IUsedPrescriptionService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin, Doctor, Patient")]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _service.GetByIdAsync(id);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin, Pharmacist")]
        public async Task<IActionResult> Create([FromBody] UsedPrescriptionCreateDto dto)
        {
            await _service.CreateAsync(dto);

            // Hangfire arxa plan işi
            BackgroundJob.Enqueue(() => Console.WriteLine($"Sistem Mesajı: {DateTime.Now} - Resept sistemdə uğurla istifadə olundu. Pasiyentə məlumat göndərildi!"));

            return StatusCode(201);
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update([FromBody] UsedPrescriptionUpdateDto dto)
        {
            await _service.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("SoftDelete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            await _service.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpPut("Restore/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Restore(int id)
        {
            await _service.RestoreAsync(id);

            return Ok(new { message = "İstifadə edilmiş resept məlumatı arxivdən uğurla bərpa edildi!" });
        }
    }
}

