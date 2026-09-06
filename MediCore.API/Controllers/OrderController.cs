using MediCore.Business.DTOs.Order;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            if (id <= 0) return BadRequest("Id mənfi və ya sıfır ola bilməz!");

            var order = await _orderService.GetByIdAsync(id);
            return Ok(order);
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _orderService.GetAllAsync();
            return Ok(orders);
        }

        [HttpPost]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> Create([FromForm] CreateOrderDto dto)
        {
            var result = await _orderService.CreateAsync(dto);

            return StatusCode(StatusCodes.Status201Created, new
            {
                Message = result.Message,
                PaymentUrl = result.PaymentUrl
            });
        }

        [HttpPut("UpdateStatus")]
        [Authorize(Roles = "Admin,Moderator")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateOrderStatusDto dto)
        {
            if (dto.Id <= 0) return BadRequest("Id mənfi və ya sıfır ola bilməz!");

            await _orderService.UpdateStatusAsync(dto);
            return Ok("Sifarişin statusu uğurla yeniləndi!");
        }

        [HttpDelete("SoftDelete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            await _orderService.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpPut("Restore/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Restore(int id)
        {
            await _orderService.RestoreAsync(id);
            return Ok(new { message = "Sifariş arxivdən uğurla bərpa edildi!" });
        }

        [HttpGet("Success")]
        [AllowAnonymous]
        public IActionResult Success([FromQuery] int orderId)
        {
            return Ok(new
            {
                Message = "Ödənişiniz yoxlanılır və bir neçə saniyə ərzində təsdiqlənəcək. Bizi seçdiyiniz üçün təşəkkürlər!",
                OrderId = orderId
            });
        }

        [HttpGet("Cancel")]
        [AllowAnonymous]
        public IActionResult Cancel()
        {
            return BadRequest(new
            {
                Message = "Ödəniş prosesi ləğv edildi. Sifarişiniz tamamlanmadı."
            });
        }

        [HttpGet("PendingOrders")]
        [Authorize(Roles = "Courier,Admin")]
        public async Task<IActionResult> GetPendingOrders()
        {
            var orders = await _orderService.GetPendingOrdersAsync();
            return Ok(orders);
        }
    }
}
