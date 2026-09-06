using MediCore.Business.DTOs.LabResultDetailDto;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LabResultDetailController : ControllerBase
    {
        readonly ILabResultDetailService _detailService;

        public LabResultDetailController(ILabResultDetailService detailService)
        {
            _detailService = detailService;
        }

        [HttpPut]
        [Authorize(Roles = "Admin, Doctor")]
        public async Task<IActionResult> Update([FromBody] UpdateLabResultDetailDto dto)
        {
            await _detailService.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("SoftDelete/{id}")]
        [Authorize(Roles = "Admin, Doctor")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            await _detailService.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpPut("Restore/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Restore(int id)
        {
            await _detailService.RestoreAsync(id);
            return Ok(new { message = "Analiz detalı arxivdən uğurla bərpa edildi!" });
        }
    }
}
