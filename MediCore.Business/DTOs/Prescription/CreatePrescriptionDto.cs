using FluentValidation;
using MediCore.Business.DTOs.PrescriptionItem;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Prescription
{
    public record CreatePrescriptionDto
    {
        public int ConsultationId { get; set; }
        public string Instructions { get; set; }

        // Dermanlarin siyahisi
        public List<CreatePrescriptionItemDto> Items { get; set; }
    }

    public class CreatePrescriptionDtoValidator : AbstractValidator<CreatePrescriptionDto>
    {
        public CreatePrescriptionDtoValidator()
        {
            RuleFor(x => x.ConsultationId)
                .GreaterThan(0)
                .WithMessage("Konsultasiya ID düzgün deyil!");

            RuleFor(x => x.Items)
                .NotEmpty()
                .WithMessage("Reseptdə ən azı 1 dərman olmalıdır!");

            RuleForEach(x => x.Items)
                .SetValidator(new CreatePrescriptionItemDtoValidator());
        }
    }
}
