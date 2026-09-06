using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Consultation
{
    public record CreateConsultationDto
    {
        public int DoctorId { get; set; } // Xeste hekimi secir

        // Qebulun vaxti
        public DateTime ScheduledTime { get; set; }

        // Sikayetler ve ya ilkin qeydler (isteyə bagli)
        public string? Notes { get; set; }
    }

    public class CreateConsultationDtoValidator : AbstractValidator<CreateConsultationDto>
    {
        public CreateConsultationDtoValidator()
        {
            RuleFor(x => x.DoctorId)
                .NotEmpty()
                .WithMessage("Zəhmət olmasa, qəbuluna yazılmaq istədiyiniz həkimi seçin.");

            RuleFor(x => x.ScheduledTime)
                .GreaterThan(DateTime.Now)
                .WithMessage("Keçmiş tarixə görüş təyin edilə bilməz!");
        }
    }
}