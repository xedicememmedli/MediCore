using MediCore.Business.DTOs.Doctor;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DoctorController : ControllerBase
    {
        readonly IDoctorService _doctorService;

        public DoctorController(IDoctorService doctorService)
        {
            _doctorService = doctorService;
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _doctorService.GetByIdAsync(id));
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _doctorService.GetAllAsync());
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromForm] CreateDoctorDto dto)
        {
            var result = await _doctorService.CreateAsync(dto);
            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPut]
        [Authorize(Roles = "Admin, Doctor")]
        public async Task<IActionResult> Update([FromForm] UpdateDoctorDto dto)
        {
            await _doctorService.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            await _doctorService.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpPut("Restore/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Restore(int id)
        {
            await _doctorService.RestoreAsync(id);
            return Ok(new { message = "Həkimin məlumatları arxivdən uğurla bərpa edildi!" });
        }

        [HttpPut("update-my-profile")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> UpdateMyProfile([FromForm] UpdateDoctorDto dto)
        {
            // DÜZƏLIŞ: ?.Value null ola bilər — yoxlama əlavə edildi
            var doctorIdClaim = User.FindFirst("DoctorId")?.Value;
            if (doctorIdClaim == null)
                return Unauthorized(new { message = "Həkim kimliyi tapılmadı." });

            dto.Id = int.Parse(doctorIdClaim);
            await _doctorService.UpdateAsync(dto);

            return Ok(new { message = "Profil uğurla yeniləndi" });
        }
    }
}
