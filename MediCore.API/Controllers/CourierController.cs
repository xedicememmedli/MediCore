using MediCore.Business.DTOs.Courier;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CourierController : ControllerBase
    {
        readonly ICourierService _courierService;

        public CourierController(ICourierService courierService)
        {
            _courierService = courierService;
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin, Courier")]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _courierService.GetByIdAsync(id));
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _courierService.GetAllAsync());
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromForm] CreateCourierDto dto)
        {
            await _courierService.CreateAsync(dto);
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update([FromForm] UpdateCourierDto dto)
        {
            await _courierService.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            await _courierService.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpPut("Restore/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Restore(int id)
        {
            await _courierService.RestoreAsync(id);
            return Ok(new { message = "Kuryer arxivdən uğurla bərpa edildi!" });
        }

        [HttpPut("take-order/{orderId}")]
        [Authorize(Roles = "Courier")]
        public async Task<IActionResult> TakeOrder(int orderId)
        {
            // DÜZƏLIŞ: ?.Value null ola bilər — birbaşa int.Parse etmək NullReferenceException verir.
            // Əvvəl yoxlama əlavə edildi.
            var courierIdClaim = User.FindFirst("CourierId")?.Value;
            if (courierIdClaim == null)
                return Unauthorized(new { message = "Kuryer kimliyi tapılmadı." });

            var courierId = int.Parse(courierIdClaim);
            await _courierService.TakeOrderAsync(courierId, orderId);

            return Ok(new { message = "Sifariş kuryer tərəfindən götürüldü" });
        }

        [HttpPut("update-my-profile")]
        [Authorize(Roles = "Courier")]
        public async Task<IActionResult> UpdateMyProfile([FromForm] UpdateCourierDto dto)
        {
            // DÜZƏLIŞ: eyni null yoxlama buraya da əlavə edildi
            var courierIdClaim = User.FindFirst("CourierId")?.Value;
            if (courierIdClaim == null)
                return Unauthorized(new { message = "Kuryer kimliyi tapılmadı." });

            dto.Id = int.Parse(courierIdClaim);
            await _courierService.UpdateAsync(dto);

            return Ok(new { message = "Profil uğurla yeniləndi" });
        }
    }
}
