using AutoMapper;
using MediCore.Business.DTOs.UsedPrescription;
using MediCore.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Profiles
{
    public class UsedPrescriptionProfile : Profile
    {
        public UsedPrescriptionProfile()
        {
            CreateMap<UsedPrescriptionCreateDto, UsedPrescription>();

            CreateMap<UsedPrescriptionUpdateDto, UsedPrescription>();

            CreateMap<UsedPrescription, UsedPrescriptionGetDto>()
                .ForMember(dest => dest.IsFullyUsed,
                           opt => opt.MapFrom(src => src.UsedQuantity >= src.TotalAllowedQuantity));

            CreateMap<UsedPrescription, UsedPrescriptionGetAllDto>()
                .ForMember(dest => dest.IsFullyUsed,
                           opt => opt.MapFrom(src => src.UsedQuantity >= src.TotalAllowedQuantity));
        }
    }
}
