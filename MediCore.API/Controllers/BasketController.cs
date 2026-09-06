using MediCore.Business.Helpers.Exceptions.BasketExceptions;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BasketController : ControllerBase
    {
        readonly IBasketService _basketService;

        public BasketController(IBasketService basketService)
        {
            _basketService = basketService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _basketService.GetByIdAsync(id);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _basketService.GetAllAsync();
            return Ok(result);
        }

        [HttpPost("add-from-prescription/{prescriptionId}")]
        public async Task<IActionResult> AddFromPrescription(int prescriptionId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var warnings = await _basketService.AddFromPrescriptionAsync(prescriptionId, userId);

            if (warnings.Any())
                return Ok(new { Message = "Bəzi dərmanlar stokda yoxdur.", Warnings = warnings });

            return Ok(new { Message = "Resept uğurla səbətə əlavə edildi!" });
        }
    }
}
