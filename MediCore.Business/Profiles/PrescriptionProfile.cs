using AutoMapper;
using MediCore.Business.DTOs.Prescription;
using MediCore.Core.Entities;

namespace MediCore.Business.Profiles
{
    public class PrescriptionProfile : Profile
    {
        public PrescriptionProfile()
        {
            CreateMap<CreatePrescriptionDto, Prescription>()
             .ForMember(dest => dest.PrescriptionItems, opt => opt.MapFrom(src => src.Items));
            CreateMap<UpdatePrescriptionDto, Prescription>();

            CreateMap<Prescription, GetPrescriptionDto>()
                .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.PrescriptionItems))
                .ForMember(dest => dest.DoctorName, opt => opt.MapFrom(src => src.Consultation.Doctor.AppUser.Name))
                .ForMember(dest => dest.PatientName, opt => opt.MapFrom(src => src.Consultation.Patient.Name));

            CreateMap<Prescription, GetAllPrescriptionDto>()
                .ForMember(dest => dest.DoctorName, opt => opt.MapFrom(src => src.Consultation.Doctor.AppUser.Name))
                .ForMember(dest => dest.PatientName, opt => opt.MapFrom(src => src.Consultation.Patient.Name));
        }
    }
}
