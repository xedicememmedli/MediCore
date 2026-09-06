using AutoMapper;
using Hangfire;
using MediCore.Business.DTOs.User;
using MediCore.Business.Helpers.Exceptions.UserExceptions;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using MediCore.DAL.Context;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MediCore.Business.Services.Implementations
{
    public class UserService : IUserService
    {
        readonly UserManager<AppUser> _userManager;
        readonly IConfiguration _config;
        readonly IMapper _mapper;
        readonly IPhotoService _photoService;
        readonly AppDbContext _context;

        public UserService(UserManager<AppUser> userManager, IMapper mapper, IConfiguration config, IPhotoService photoService, AppDbContext context)
        {
            _userManager = userManager;
            _mapper = mapper;
            _config = config;
            _photoService = photoService;
            _context = context;
        }

        public async Task<string> RegisterAsync(RegisterDto dto)
        {
            if (await _userManager.FindByEmailAsync(dto.Email) != null)
                throw new UserRegisterException("Bu e-poçt ünvanı artıq sistemdə mövcuddur.");

            if (await _userManager.FindByNameAsync(dto.UserName) != null)
                throw new UserRegisterException("Bu istifadəçi adı artıq məşğuldur. Zəhmət olmasa, başqa ad seçin.");

            var appUser = _mapper.Map<AppUser>(dto);

            if (!string.IsNullOrWhiteSpace(dto.InsuranceNumber))
            {
                var insurance = await _context.InsuranceRecords
                    .FirstOrDefaultAsync(x => x.InsuranceNumber == dto.InsuranceNumber && !x.IsUsed);

                if (insurance == null)
                    throw new UserRegisterException("Sığorta nömrəsi etibarsızdır və ya artıq istifadə olunub.");

                appUser.HasInsurance = true;
                appUser.InsuranceCompany = dto.InsuranceNumber;
                insurance.IsUsed = true;
            }

            var result = await _userManager.CreateAsync(appUser, dto.Password);

            if (!result.Succeeded)
            {
                var sb = new StringBuilder();
                foreach (var error in result.Errors)
                    sb.Append(error.Description + " ");
                throw new UserRegisterException(sb.ToString().TrimEnd());
            }

            string assignedRole = !string.IsNullOrWhiteSpace(dto.Role) ? dto.Role : "Patient";
            await _userManager.AddToRoleAsync(appUser, assignedRole);

            if (appUser.HasInsurance)
                await _context.SaveChangesAsync();

            BackgroundJob.Enqueue<IEmailService>(emailService =>
                emailService.SendWelcomeEmailAsync(dto.Email, dto.Name, assignedRole)
            );

            return appUser.Id;
        }

        public async Task<string> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.UserName);

            if (user == null)
                user = await _userManager.FindByNameAsync(loginDto.UserName);

            if (user == null)
                throw new UserLoginFailedException("İstifadəçi adı və ya şifrə yanlışdır.");

            var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);

            if (!result)
                throw new UserLoginFailedException("İstifadəçi adı və ya şifrə yanlışdır.");

            return await GenerateJwtTokenAsync(user);
        }

        public async Task<UserProfileDto> GetUserProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                throw new UserNotFoundException("İstifadəçi tapılmadı.");

            var roles = await _userManager.GetRolesAsync(user);

            return new UserProfileDto
            {
                Id = user.Id,
                Name = user.Name,
                UserName = user.UserName,
                Email = user.Email,
                Roles = roles
            };
        }

        public async Task<string> UpdateUsernameAsync(string userId, UpdateUsernameDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) throw new UserNotFoundException("İstifadəçi tapılmadı.");

            var existingUser = await _userManager.FindByNameAsync(dto.NewUsername);
            if (existingUser != null && existingUser.Id != userId)
                throw new UserRegisterException("Bu istifadəçi adı artıq başqası tərəfindən istifadə olunur.");

            var result = await _userManager.SetUserNameAsync(user, dto.NewUsername);
            if (!result.Succeeded)
                throw new Exception("İstifadəçi adını yeniləyərkən sistem xətası baş verdi.");

            await _userManager.UpdateNormalizedUserNameAsync(user);

            // BUG DÜZƏLDİLDİ: Rollar da token-ə daxil edilir
            return await GenerateJwtTokenAsync(user);
        }

        // BUG DÜZƏLDİLDİ: async edildi, UserManager-dən rollar alınır və token-ə əlavə olunur
        private async Task<string> GenerateJwtTokenAsync(AppUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim("Name", user.Name ?? "")
            };

            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));

            var securityKeyString = _config["Jwt:SecurityKey"];
            if (string.IsNullOrEmpty(securityKeyString))
                throw new Exception("Sistem xətası: JWT Security Key tapılmadı. Zəhmət olmasa, appsettings.json faylını yoxlayın.");

            SecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(securityKeyString));
            SigningCredentials signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            JwtSecurityToken jwtToken = new JwtSecurityToken(
                audience: _config["Jwt:Audience"],
                issuer: _config["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(30), // <-- DƏYİŞİKLİK BURADA EDİLDİ (60 dəqiqə yerinə 30 gün)
                signingCredentials: signingCredentials
            );

            return new JwtSecurityTokenHandler().WriteToken(jwtToken);
        }

        public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null) return;

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            BackgroundJob.Enqueue<IEmailService>(emailService =>
                emailService.SendPasswordResetEmailAsync(user.Email!, user.Name, token)
            );
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null) throw new Exception("İstifadəçi tapılmadı.");

            var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);

            if (!result.Succeeded)
            {
                var sb = new StringBuilder();
                foreach (var error in result.Errors)
                    sb.Append(error.Description + " ");
                throw new Exception(sb.ToString().TrimEnd());
            }
        }

        public async Task<List<UserProfileDto>> GetAllPatientsAsync()
        {
            var patients = await _userManager.GetUsersInRoleAsync("Patient");
            var userDtos = _mapper.Map<List<UserProfileDto>>(patients);

            for (int i = 0; i < patients.Count; i++)
            {
                var roles = await _userManager.GetRolesAsync(patients[i]);
                userDtos[i].Roles = roles.ToList();
                userDtos[i].WalletBalance = patients[i].WalletBalance;
                userDtos[i].HasInsurance = patients[i].HasInsurance;
            }

            return userDtos;
        }

        public async Task SoftDeleteAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) throw new Exception("Sistemdə belə bir istifadəçi tapılmadı.");

            user.IsDeleted = true;
            await _userManager.UpdateAsync(user);
        }

        public async Task RestoreAsync(string id)
        {
            var deletedUser = await _userManager.Users
                                  .FirstOrDefaultAsync(x => x.Id == id && x.IsDeleted == true);

            if (deletedUser == null)
                throw new Exception("Arxivdə (silinmişlər siyahısında) belə bir istifadəçi tapılmadı.");

            deletedUser.IsDeleted = false;
            await _userManager.UpdateAsync(deletedUser);
        }

        public async Task TopUpWalletAsync(string userId, decimal amount)
        {
            if (amount <= 0) throw new UserRegisterException("Artırılacaq məbləğ 0-dan böyük olmalıdır.");
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) throw new UserRegisterException("İstifadəçi tapılmadı.");
            user.WalletBalance += amount;
            await _userManager.UpdateAsync(user);
        }

        public async Task<decimal> GetWalletBalanceAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) throw new UserRegisterException("İstifadəçi tapılmadı.");
            return user.WalletBalance;
        }

        public async Task AddInsuranceAsync(string userId, string insuranceNumber)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) throw new UserRegisterException("İstifadəçi tapılmadı.");

            if (user.HasInsurance) throw new UserRegisterException("Sizin aktiv sığortanız artıq sistemdə mövcuddur.");

            var insurance = await _context.InsuranceRecords
                .FirstOrDefaultAsync(x => x.InsuranceNumber == insuranceNumber && !x.IsUsed);

            if (insurance == null) throw new UserRegisterException("Daxil etdiyiniz sığorta nömrəsi etibarsızdır və ya artıq istifadə olunub.");

            user.HasInsurance = true;
            user.InsuranceCompany = insuranceNumber;
            insurance.IsUsed = true;

            await _context.SaveChangesAsync();
        }

        public async Task UpdateProfileImageAsync(string userId, string imageUrl, string publicId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                throw new UserNotFoundException("İstifadəçi tapılmadı.");

            if (!string.IsNullOrEmpty(user.ProfileImagePublicId))
                await _photoService.DeletePhotoAsync(user.ProfileImagePublicId);

            user.ProfileImageUrl = imageUrl;
            user.ProfileImagePublicId = publicId;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
                throw new Exception("Profil şəklini məlumat bazasına yazarkən xəta baş verdi.");
        }
    }
}