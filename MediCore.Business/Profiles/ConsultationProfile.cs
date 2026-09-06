using AutoMapper;
using MediCore.Business.DTOs.Consultation;
using MediCore.Core.Entities;

namespace MediCore.Business.Profiles
{
    public class ConsultationProfile : Profile
    {
        public ConsultationProfile()
        {
            CreateMap<CreateConsultationDto, Consultation>();
            CreateMap<UpdateConsultationDto, Consultation>();
            CreateMap<Consultation, GetConsultationDto>();
            CreateMap<Consultation, GetAllConsultationDto>();
        }
    }
}
