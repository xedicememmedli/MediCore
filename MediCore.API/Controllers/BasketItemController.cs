using MediCore.Business.DTOs.BasketItem;
using MediCore.Business.Helpers.Exceptions.BasketExceptions;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Helpers.Exceptions.MedicineExceptions;
using MediCore.Business.Helpers.Exceptions.UserExceptions;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BasketItemController : ControllerBase
    {
        readonly IBasketItemService _basketItemService;

        public BasketItemController(IBasketItemService basketItemService)
        {
            _basketItemService = basketItemService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _basketItemService.GetByIdAsync(id));
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _basketItemService.GetAllAsync());
        }

        [HttpPost]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> Create([FromForm] CreateBasketItemDto dto)
        {
            var result = await _basketItemService.CreateAsync(dto);
            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPut]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> Update([FromForm] UpdateBasketItemDto dto)
        {
            await _basketItemService.UpdateAsync(dto);
            return NoContent();
        }

        // FIX: "Patient, Admin" -> "Patient,Admin" (boşluq bug-u düzəldildi)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Patient,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _basketItemService.DeleteAsync(id);
            return NoContent();
        }

        // FIX: "Patient, Admin" -> "Patient,Admin" (boşluq bug-u düzəldildi)
        [HttpDelete("SoftDelete/{id}")]
        [Authorize(Roles = "Patient,Admin")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            await _basketItemService.SoftDeleteAsync(id);
            return NoContent();
        }
    }
}
