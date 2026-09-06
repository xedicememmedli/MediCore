using MediCore.Business.DTOs.Notification;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _notificationService.GetByIdAsync(id));
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _notificationService.GetAllAsync());
        }

        [HttpGet("UserNotifications/{userId}")]
        public async Task<IActionResult> GetUserNotifications(string userId)
        {
            return Ok(await _notificationService.GetUserNotificationsAsync(userId));
        }

        [HttpPut("MarkAsRead/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            await _notificationService.MarkAsReadAsync(id);
            return Ok(new { message = "Bildiriş oxundu olaraq işarələndi!" });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNotificationDto dto)
        {
            var result = await _notificationService.CreateAsync(dto);
            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateNotificationDto dto)
        {
            await _notificationService.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _notificationService.DeleteAsync(id);
            return NoContent();
        }

        [HttpDelete("SoftDelete/{id}")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            await _notificationService.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpPut("Restore/{id}")]
        public async Task<IActionResult> Restore(int id)
        {
            await _notificationService.RestoreAsync(id);
            return Ok(new { message = "Bildiriş arxivdən uğurla bərpa edildi!" });
        }
    }
}