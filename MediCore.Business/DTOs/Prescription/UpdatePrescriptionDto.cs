using FluentValidation;
using MediCore.Business.DTOs.PrescriptionItem;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Prescription
{
    public record UpdatePrescriptionDto
    {
        public int Id { get; set; }
        public string Instructions { get; set; }

        // Yenilenmis dermanlarin siyahisi
        public List<UpdatePrescriptionItemDto> Items { get; set; }
    }

    public class UpdatePrescriptionDtoValidator : AbstractValidator<UpdatePrescriptionDto>
    {
        public UpdatePrescriptionDtoValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("Resept ID düzgün deyil!");

            RuleFor(x => x.Items)
                .NotEmpty()
                .WithMessage("Reseptdə ən azı 1 dərman olmalıdır!");

            RuleForEach(x => x.Items).SetValidator(new UpdatePrescriptionItemDtoValidator());
        }
    }

}
