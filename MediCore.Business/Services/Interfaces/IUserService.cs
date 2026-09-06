using MediCore.Business.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface IUserService
    {
        Task<string> RegisterAsync(RegisterDto dto);
        Task<string> LoginAsync(LoginDto loginDto);
        Task<UserProfileDto> GetUserProfileAsync(string userId);
        Task<string> UpdateUsernameAsync(string userId, UpdateUsernameDto dto);
        Task ForgotPasswordAsync(ForgotPasswordDto dto);
        Task ResetPasswordAsync(ResetPasswordDto dto);
        Task<List<UserProfileDto>> GetAllPatientsAsync();
        Task SoftDeleteAsync(string id);
        Task RestoreAsync(string id);
        Task UpdateProfileImageAsync(string userId, string imageUrl, string publicId);
        Task AddInsuranceAsync(string userId, string insuranceNumber);
        Task TopUpWalletAsync(string userId, decimal amount);
        Task<decimal> GetWalletBalanceAsync(string userId);
    }
}


