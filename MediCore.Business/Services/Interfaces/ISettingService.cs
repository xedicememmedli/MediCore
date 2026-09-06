using MediCore.Business.DTOs.Setting;

namespace MediCore.Business.Services.Interfaces
{
    public interface ISettingService
    {
        Task<GetSettingDto> CreateAsync(CreateSettingDto settingDto);
        Task DeleteAsync(int id);
        Task<List<GetSettingDto>> GetAllAsync();
        Task<GetSettingDto> GetByIdAsync(int id);
        Task<GetSettingDto> GetByKeyAsync(string key);
        Task SoftDeleteAsync(int id);
        Task UpdateAsync(UpdateSettingDto settingDto);
    }
}
