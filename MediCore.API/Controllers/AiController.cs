using MediCore.Business.DTOs;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MediCore.API.Controllers
{
    // FIX: [Authorize] əlavə edildi - əvvəl hər kəs bu endpointə sorğu göndərə bilirdi
    // Bu isə Gemini API xərclərini artırırdı
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AiController : ControllerBase
    {
        private readonly IAiService _aiService;

        public AiController(IAiService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("ask-pharmacist")]
        public async Task<IActionResult> AskPharmacist([FromBody] ChatRequestDto dto)
        {
            var result = await _aiService.AskVirtualPharmacistAsync(dto);
            return Ok(result);
        }
    }
}
