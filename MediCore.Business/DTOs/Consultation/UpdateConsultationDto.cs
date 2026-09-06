using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Consultation
{
    public record UpdateConsultationDto
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public string PatientId { get; set; }
        public DateTime ScheduledDate { get; set; }
    }

    public class UpdateConsultationDtoValidator : AbstractValidator<UpdateConsultationDto>
    {
        public UpdateConsultationDtoValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("ID düzgün deyil");
            RuleFor(x => x.DoctorId)
                .GreaterThan(0)
                .WithMessage("Həkim seçilməlidir");
            RuleFor(x => x.PatientId)
                .NotEmpty()
                .WithMessage("Xəstə ID boş ola bilməz");
            RuleFor(x => x.ScheduledDate)
                .GreaterThan(DateTime.Now)
                .WithMessage("Keçmiş tarixə görüs təyin edilə bilməz");
        }
    }
}
