using AutoMapper;
using MediCore.Business.DTOs.User;
using MediCore.Core.Entities;

namespace MediCore.Business.Profiles
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<RegisterDto, AppUser>().ReverseMap();
            CreateMap<AppUser, UserProfileDto>().ReverseMap();
        }
    }
}
