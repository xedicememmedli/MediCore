using MediCore.Business.DTOs.Specialty;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Helpers.Exceptions.Specialty;
using MediCore.Business.Services.Implementations;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SpecialtyController : ControllerBase
    {
        readonly ISpecialtyService _specialtyService;

        public SpecialtyController(ISpecialtyService specialtyService)
        {
            _specialtyService = specialtyService;
        }

        [HttpGet("{id}")]
        [AllowAnonymous] 
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _specialtyService.GetByIdAsync(id));
        }

        [HttpGet]
        [AllowAnonymous] 
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _specialtyService.GetAllAsync());
        }

        [HttpPost]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> Create([FromForm] CreateSpecialtyDto dto)
        {
            await _specialtyService.CreateAsync(dto);
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpPut]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> Update([FromForm] UpdateSpecialtyDto dto)
        {
            await _specialtyService.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("SoftDelete/{id}")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> SoftDelete(int id)
        {
            await _specialtyService.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpPut("Restore/{id}")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> Restore(int id)
        {
            await _specialtyService.RestoreAsync(id);

            return Ok(new { message = "İxtisas arxivdən uğurla bərpa edildi!" });
        }
    }
}