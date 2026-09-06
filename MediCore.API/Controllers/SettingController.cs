using MediCore.Business.DTOs.Setting;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SettingController : ControllerBase
    {
        readonly ISettingService _settingService;

        public SettingController(ISettingService settingService)
        {
            _settingService = settingService;
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(int id)
        {
            return Ok(await _settingService.GetByIdAsync(id));
        }

        [HttpGet("getbykey/{key}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByKey(string key)
        {
            return Ok(await _settingService.GetByKeyAsync(key));
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {           
                return Ok(await _settingService.GetAllAsync());          
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromForm] CreateSettingDto dto)
        {
          
                var result = await _settingService.CreateAsync(dto);
                return StatusCode(StatusCodes.Status201Created, result);
           
        }

        [HttpPut]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update([FromForm] UpdateSettingDto dto)
        {
           
                await _settingService.UpdateAsync(dto);
                return NoContent();
           
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
           
                await _settingService.DeleteAsync(id);
                return NoContent();
           
        }

        [HttpDelete("SoftDelete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SoftDelete(int id)
        {
           
                await _settingService.SoftDeleteAsync(id);
                return NoContent();
           
        }
    }
}
