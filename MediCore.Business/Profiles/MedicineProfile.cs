using AutoMapper;
using MediCore.Business.DTOs.Medicine;
using MediCore.Core.Entities;

namespace MediCore.Business.Profiles
{
    public class MedicineProfile : Profile
    {
        public MedicineProfile()
        {
            CreateMap<Medicine, GetMedicineDto>()
                .ForMember(dest => dest.Categories, opt => opt.MapFrom(src => src.MedicinesCategories.Select(mc => mc.Category)));

            CreateMap<CreateMedicineDto, Medicine>();
            CreateMap<UpdateMedicineDto, Medicine>();
        }
    }
}
