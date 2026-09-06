using AutoMapper;
using MediCore.Business.DTOs.Doctor;
using MediCore.Core.Entities;

namespace MediCore.Business.Profiles
{
    public class DoctorProfile : Profile
    {
        public DoctorProfile()
        {
            CreateMap<CreateDoctorDto, Doctor>();
            CreateMap<UpdateDoctorDto, Doctor>();

            CreateMap<Doctor, GetDoctorDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.AppUser.Name)) // UserName -> Name olaraq düzəldildi
                .ForMember(dest => dest.SpecialtyName, opt => opt.MapFrom(src => src.Specialty.Name));

            CreateMap<Doctor, GetAllDoctorDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.AppUser.Name));
        }
    }
}
