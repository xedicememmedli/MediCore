using AutoMapper;
using MediCore.Business.DTOs.Specialty;
using MediCore.Core.Entities;

namespace MediCore.Business.Profiles
{
    public class SpecialtyProfile : Profile
    {
        public SpecialtyProfile()
        {
            CreateMap<CreateSpecialtyDto, Specialty>();
            CreateMap<UpdateSpecialtyDto, Specialty>();
            CreateMap<Specialty, GetSpecialtyDto>();
            CreateMap<Specialty, GetAllSpecialtyDto>();
        }
    }
}
