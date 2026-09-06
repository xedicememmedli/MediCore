using MediCore.Business.DTOs.PrescriptionItem;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PrescriptionItemController : ControllerBase
    {
        readonly IPrescriptionItemService _prescriptionItemService;

        public PrescriptionItemController(IPrescriptionItemService prescriptionItemService)
        {
            _prescriptionItemService = prescriptionItemService;
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin, Doctor, Patient")]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _prescriptionItemService.GetByIdAsync(id));
        }

        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> Create([FromForm] CreatePrescriptionItemDto dto)
        {
            await _prescriptionItemService.CreateAsync(dto);
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpPut]
        [Authorize(Roles = "Admin, Doctor")]
        public async Task<IActionResult> Update([FromForm] UpdatePrescriptionItemDto dto)
        {
            await _prescriptionItemService.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("SoftDelete/{id}")]
        [Authorize(Roles = "Admin, Doctor")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            await _prescriptionItemService.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpPut("Restore/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Restore(int id)
        {
            await _prescriptionItemService.RestoreAsync(id);
            return Ok(new { message = "Resept detalı (dərman təyinatı) arxivdən uğurla bərpa edildi!" });
        }
    }
}
