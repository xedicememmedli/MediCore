using AutoMapper;
using MediCore.Business.DTOs.Setting;
using MediCore.Business.Helpers.Exceptions.Common;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;


namespace MediCore.Business.Services.Implementations
{
    public class SettingService : ISettingService
    {
         readonly ISettingRepository _rep;
         readonly IMapper _mapper;

        public SettingService(ISettingRepository rep, IMapper mapper)
        {
            _rep = rep;
            _mapper = mapper;
        }

        public async Task<GetSettingDto> CreateAsync(CreateSettingDto settingDto)
        {
            if (await _rep.IsExsist(c => c.Key.ToLower() == settingDto.Key.ToLower() && c.IsDeleted == false))
            {
                throw new Exception("Bu Key artıq mövcuddur!");
            }

            var setting = _mapper.Map<Setting>(settingDto);

            var newSetting = await _rep.CreateAsync(setting);
            await _rep.SaveChangesAsync();

            return _mapper.Map<GetSettingDto>(newSetting);
        }

        public async Task DeleteAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var setting = await _rep.FindAll(x => x.Id == id).FirstOrDefaultAsync();
            if (setting == null) throw new Exception("Silinməli olan setting tapılmadı!");

            _rep.Delete(setting);
            await _rep.SaveChangesAsync();
        }

        public async Task<List<GetSettingDto>> GetAllAsync()
        {
            var settings = await _rep.FindAll(x => x.IsDeleted == false).ToListAsync();
            return _mapper.Map<List<GetSettingDto>>(settings);
        }

        public async Task<GetSettingDto> GetByIdAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var setting = await _rep.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();

            if (setting == null) throw new Exception("Bu id-ye uyğun setting tapılmadı!");

            return _mapper.Map<GetSettingDto>(setting);
        }

        public async Task<GetSettingDto> GetByKeyAsync(string key)
        {
            if (string.IsNullOrWhiteSpace(key)) throw new Exception("Key boş ola bilməz!");

            var setting = await _rep.FindAll(x => x.Key.ToLower() == key.ToLower() && x.IsDeleted == false).FirstOrDefaultAsync();

            if (setting == null) throw new Exception("Bu key-ə uyğun setting tapılmadı!");

            return _mapper.Map<GetSettingDto>(setting);
        }

        public async Task SoftDeleteAsync(int id)
        {
            if (id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var setting = await _rep.FindAll(x => x.Id == id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (setting == null) throw new Exception("Silinməli olan setting tapılmadı!");

            _rep.SoftDelete(setting);
            await _rep.SaveChangesAsync();
        }

        public async Task UpdateAsync(UpdateSettingDto settingDto)
        {
            if (settingDto.Id <= 0) throw new NegativeIdException("Id mənfi ola bilməz!");

            var setting = await _rep.FindAll(x => x.Id == settingDto.Id && x.IsDeleted == false).FirstOrDefaultAsync();
            if (setting == null) throw new Exception("Yenilənməli olan setting tapılmadı!");

            // Eger Key deyisdirilirse, yeni Key-in basqa setting-de olub-olmadigini yoxlayiriq
            if (await _rep.IsExsist(c => c.Key.ToLower() == settingDto.Key.ToLower() && c.Id != settingDto.Id && c.IsDeleted == false))
            {
                throw new Exception("Bu Key artıq başqa bir setting üçün istifadə olunur!");
            }

            _mapper.Map(settingDto, setting);
            _rep.Update(setting);
            await _rep.SaveChangesAsync();
        }
    }
}
