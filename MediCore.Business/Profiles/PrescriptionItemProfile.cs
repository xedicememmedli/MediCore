using AutoMapper;
using MediCore.Business.DTOs.PrescriptionItem;
using MediCore.Core.Entities;

namespace MediCore.Business.Profiles
{
    public class PrescriptionItemProfile : Profile
    {
        public PrescriptionItemProfile()
        {
            CreateMap<PrescriptionItem, GetPrescriptionItemDto>()
                .ForMember(dest => dest.MedicineName, opt => opt.MapFrom(src => src.Medicine.Name));

            CreateMap<CreatePrescriptionItemDto, PrescriptionItem>();
            CreateMap<UpdatePrescriptionItemDto, PrescriptionItem>();
        }
    }
}
