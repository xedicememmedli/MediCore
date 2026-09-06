using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims; // ClaimTypes üçün vacibdir

namespace MediCore.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        readonly IUserService _userService;
        readonly IPhotoService _photoService;

        public UserController(IUserService userService, IPhotoService photoService)
        {
            _userService = userService;
            _photoService = photoService;
        }

        [HttpGet("GetAllPatients")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var patients = await _userService.GetAllPatientsAsync();
            return Ok(patients);
        }

        [HttpDelete("SoftDelete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SoftDelete(string id)
        {
            await _userService.SoftDeleteAsync(id);
            return NoContent();
        }

        [HttpPut("Restore/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Restore(string id)
        {
            await _userService.RestoreAsync(id);
            return Ok(new { message = "İstifadəçi (Pasiyent) arxivdən uğurla bərpa edildi!" });
        }

        [HttpPost("UploadProfileImage/{id}")]
        public async Task<IActionResult> UploadProfileImage(string id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Zəhmət olmasa bir şəkil seçin.");

            var uploadResult = await _photoService.AddPhotoAsync(file);

            if (uploadResult.Error != null)
                return BadRequest(uploadResult.Error.Message);

            var photoUrl = uploadResult.SecureUrl.ToString();
            var publicId = uploadResult.PublicId;

            await _userService.UpdateProfileImageAsync(id, photoUrl, publicId);

            return Ok(new
            {
                Message = "Profil şəkli uğurla yükləndi!",
                Url = photoUrl
            });
        }

        [HttpPost("AddInsurance")]
        public async Task<IActionResult> AddInsurance([FromBody] string insuranceNumber)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            await _userService.AddInsuranceAsync(userId, insuranceNumber);
            return Ok(new { message = "Sığorta uğurla əlavə edildi! Artıq sığortalı xidmətlərdən yararlana bilərsiniz." });
        }

        [HttpPost("TopUpWallet")]
        public async Task<IActionResult> TopUpWallet([FromBody] decimal amount)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            await _userService.TopUpWalletAsync(userId, amount);
            return Ok(new { message = "Məbləğ pul kisəsinə (Wallet) uğurla əlavə edildi!" });
        }

        [HttpGet("WalletBalance")]
        public async Task<IActionResult> GetWalletBalance()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var balance = await _userService.GetWalletBalanceAsync(userId);

            return Ok(new { balance = balance });
        }
    }
}