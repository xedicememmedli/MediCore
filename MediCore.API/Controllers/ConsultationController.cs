using Hangfire;
using MediCore.Business.DTOs.Consultation;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ConsultationController : ControllerBase
    {
        readonly IConsultationService _consultationService;

        public ConsultationController(IConsultationService consultationService)
        {
            _consultationService = consultationService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _consultationService.GetByIdAsync(id));
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _consultationService.GetAllAsync());
        }

        [HttpPost]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> Create([FromBody] CreateConsultationDto dto)
        {
            string paymentUrl = await _consultationService.CreateAsync(dto);

            // HANGFIRE: Xatirlatma Taymeri Qurulur 
            DateTime appointmentTime = dto.ScheduledTime;
            DateTime notifyTime = appointmentTime.AddHours(-2);
           
            TimeSpan delay = notifyTime - DateTime.UtcNow;

            if (delay.TotalSeconds > 0)
            {
                BackgroundJob.Schedule(
                    () => Console.WriteLine($"XEBERDARLIQ: Hormetli pasient, {appointmentTime:dd.MM.yyyy HH:mm} tarixinde hekim qbulunuz var!"),
                    delay
                );
            }

            return StatusCode(StatusCodes.Status201Created, new
            {
                Message = "Konsultasiya ugurla yaradildi!",
                PaymentUrl = paymentUrl
            });
        }

        [HttpPut]
        [Authorize(Roles = "Admin, Doctor")]
        public async Task<IActionResult> Update([FromBody] UpdateConsultationDto dto)
        {
            await _consultationService.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("SoftDelete/{id}")]
        [Authorize(Roles = "Admin, Doctor")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            await _consultationService.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpGet("Success")]
        [AllowAnonymous]
        public async Task<IActionResult> Success([FromQuery] int consultationId)
        {
            await _consultationService.ConfirmPaymentAsync(consultationId);

            BackgroundJob.Enqueue(() => Console.WriteLine($"Sistem Mesajı: {DateTime.UtcNow} - {consultationId} nömrəli Konsultasiya üçün ödəniş uğurla qəbul edildi!"));

            return Ok(new
            {
                Message = "Konsultasiya ödənişiniz qəbul edildi və qəbulunuz təsdiqləndi!",
                ConsultationId = consultationId
            });
        }

        [HttpGet("AvailableTimeSlots")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAvailableTimeSlots([FromQuery] int doctorId, [FromQuery] DateTime date)
        {
            var availableSlots = await _consultationService.GetAvailableTimeSlotsAsync(doctorId, date);
            return Ok(availableSlots);
        }

        [HttpPut("Restore/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Restore(int id)
        {
            await _consultationService.RestoreAsync(id);
            return Ok(new { message = "Konsultasiya arxivdən uğurla bərpa edildi!" });
        
    }
    }
}



