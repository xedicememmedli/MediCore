using MediCore.API.Hubs;
using MediCore.Business.DTOs.ChatMessage;
using MediCore.Business.Helpers.Exceptions.ChatMessage;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatMessageController : ControllerBase
    {
        readonly IChatMessageService _chatMessageService;
        readonly IHubContext<ChatHub> _hubContext;

        public ChatMessageController(IChatMessageService chatMessageService, IHubContext<ChatHub> hubContext)
        {
            _chatMessageService = chatMessageService;
            _hubContext = hubContext;
        }

        [HttpGet("history/{senderId}/{receiverId}")]
        public async Task<IActionResult> GetChatHistory(string senderId, string receiverId)
        {
            return Ok(await _chatMessageService.GetChatHistoryAsync(senderId, receiverId));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateChatMessageDto dto)
        {
            // Əvvəl bazaya yaz, sonra SignalR ilə göndər
            await _chatMessageService.CreateAsync(dto);

            await _hubContext.Clients.User(dto.ReceiverId)
                .SendAsync("ReceiveMessage", dto.SenderId, dto.Message);

            return StatusCode(StatusCodes.Status201Created, new { message = "Mesaj uğurla göndərildi!" });
        }
        [HttpDelete("SoftDelete/{id}")]
        public async Task<IActionResult> SoftDelete(int id)
        {
            await _chatMessageService.SoftDeleteAsync(id);
            return NoContent();
        }
    }
}
