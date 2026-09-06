using MediCore.Business.DTOs.Prescription;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PrescriptionController : ControllerBase
    {
        readonly IPdfService _pdfService;
        readonly IPrescriptionService _prescriptionService;

        public PrescriptionController(IPdfService pdfService, IPrescriptionService prescriptionService)
        {
            _pdfService = pdfService;
            _prescriptionService = prescriptionService;
        }

        [HttpGet("DownloadPdf/{id}")]
        [Authorize(Roles = "Admin, Doctor, Patient")]
        public async Task<IActionResult> DownloadPdf(int id)
        {
            var pdfBytes = await _pdfService.GeneratePrescriptionPdfAsync(id);
            return File(pdfBytes, "application/pdf", $"Resept_{id}.pdf");
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin, Doctor, Patient")]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _prescriptionService.GetByIdAsync(id));
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _prescriptionService.GetAllAsync());
        }

        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> Create([FromBody] CreatePrescriptionDto dto)
        {
            await _prescriptionService.CreateAsync(dto);
            Hangfire.BackgroundJob.Enqueue(() => Console.WriteLine($"Sistem Mesajı: {DateTime.UtcNow} - Yeni resept uğurla yaradıldı. Pasiyentə (Sizə) məlumat göndərildi!"));
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpPut]
        [Authorize(Roles = "Admin, Doctor")]
        public async Task<IActionResult> Update([FromForm] UpdatePrescriptionDto dto)
        {
            await _prescriptionService.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("SoftDelete/{id}")]
        [Authorize(Roles = "Admin, Doctor")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            await _prescriptionService.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpPut("Restore/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Restore(int id)
        {
            await _prescriptionService.RestoreAsync(id);
            return Ok(new { message = "Resept arxivdən uğurla bərpa edildi!" });
        }
    }
}
