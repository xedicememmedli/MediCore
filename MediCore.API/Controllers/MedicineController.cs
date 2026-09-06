using MediCore.Business.DTOs.Medicine;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MedicineController : ControllerBase
    {
        readonly IMedicineService _medicineService;

        public MedicineController(IMedicineService medicineService)
        {
            _medicineService = medicineService;
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _medicineService.GetByIdAsync(id));
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _medicineService.GetAllAsync());
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromForm] CreateMedicineDto dto)
        {
            var result = await _medicineService.CreateAsync(dto);
            return StatusCode(StatusCodes.Status201Created, result);
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update([FromForm] UpdateMedicineDto dto)
        {
            await _medicineService.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _medicineService.DeleteAsync(id);
            return NoContent();
        }

        [HttpDelete("SoftDelete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            await _medicineService.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpPut("Restore/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Restore(int id)
        {
            await _medicineService.RestoreAsync(id);
            return Ok(new { message = "Dərman arxivdən uğurla bərpa edildi!" });
        }
    }
}
