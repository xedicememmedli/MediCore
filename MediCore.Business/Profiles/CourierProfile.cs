using AutoMapper;
using MediCore.Business.DTOs.Courier;
using MediCore.Core.Entities;

namespace MediCore.Business.Profiles
{
    public class CourierProfile : Profile
    {
        public CourierProfile()
        {
            CreateMap<CreateCourierDto, Courier>();
            CreateMap<UpdateCourierDto, Courier>();
            CreateMap<Courier, GetCourierDto>();
            CreateMap<Courier, GetAllCourierDto>();
        }
    }
}
