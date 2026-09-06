using AutoMapper;
using MediCore.Business.DTOs.Setting;
using MediCore.Core.Entities;

namespace MediCore.Business.Profiles
{
    public class SettingProfile : Profile
    {
        public SettingProfile()
        {
            CreateMap<Setting, GetSettingDto>().ReverseMap();
            CreateMap<Setting, UpdateSettingDto>().ReverseMap();
            CreateMap<Setting, CreateSettingDto>().ReverseMap();
        }
    }
}
