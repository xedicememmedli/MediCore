using Hangfire;
using MediCore.Business.DTOs.User;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MediCore.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [AllowAnonymous]
        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var newUserId = await _userService.RegisterAsync(dto);

            BackgroundJob.Enqueue(() => Console.WriteLine("Təbrik edirik! Yeni istifadəçi qeydiyyatdan keçdi və Xoş gəldin mesajı göndərildi!"));

            return Ok(new
            {
                message = "Qeydiyyat uğurla tamamlandı!",
                userId = newUserId
            });
        }

        [AllowAnonymous]
        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var token = await _userService.LoginAsync(dto);
            return Ok(new { token = token });
        }

        [AllowAnonymous]
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            await _userService.ForgotPasswordAsync(dto);
            return Ok(new { message = "Şifrə sıfırlama kodu (token) email ünvanınıza göndərildi!" });
        }

        [AllowAnonymous]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            await _userService.ResetPasswordAsync(dto);
            return Ok(new { message = "Şifrəniz uğurla yeniləndi! İndi yeni şifrənizlə daxil ola bilərsiniz." });
        }

        [HttpGet("my-profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Token etibarsızdır." });

            var profile = await _userService.GetUserProfileAsync(userId);
            return Ok(profile);
        }

        [HttpPatch("update-username")]
        public async Task<IActionResult> UpdateUsername([FromBody] UpdateUsernameDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Token etibarsızdır." });

            var newToken = await _userService.UpdateUsernameAsync(userId, dto);

            return Ok(new
            {
                message = "İstifadəçi adınız uğurla yeniləndi!",
                token = newToken
            });
        }
    }
}
