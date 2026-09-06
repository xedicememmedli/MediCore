using AutoMapper;
using MediCore.Business.DTOs.LabResult;
using MediCore.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Profiles
{
    public class LabResultProfile : Profile
    {
        public LabResultProfile()
        {
            // Yaratmaq və Yeniləmək üçün (DTO -> Entity)
            CreateMap<CreateLabResultDto, LabResult>();
            CreateMap<UpdateLabResultDto, LabResult>();

            // Oxumaq üçün (Entity -> DTO)
            CreateMap<LabResult, GetLabResultDto>()
                .ForMember(dest => dest.PatientName, opt => opt.MapFrom(src => src.Patient.Name))
                .ForMember(dest => dest.DoctorName, opt => opt.MapFrom(src => src.Doctor.AppUser.Name));

            CreateMap<LabResult, GetAllLabResultDto>()
                .ForMember(dest => dest.PatientName, opt => opt.MapFrom(src => src.Patient.Name))
                .ForMember(dest => dest.DoctorName, opt => opt.MapFrom(src => src.Doctor.AppUser.Name));
        }
    }
}