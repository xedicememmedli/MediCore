using FluentValidation;
using MediCore.Business.DTOs.Prescription;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.PrescriptionItem
{
    public record CreatePrescriptionItemDto
    {
        // Hekimin secdiyi dermanin ID-si
        public int MedicineId { get; set; }

        // Qebul qaydasi (Meselen: "Gunde 2 defe, yemekden sonra")
        public string Dosage { get; set; }

        // Sifaris ucun nece qutu lazimdir
        public int Quantity { get; set; }
        public string Duration { get; set; }
        public int PrescriptionId { get; set; }

    }

    public class CreatePrescriptionItemDtoValidator : AbstractValidator<CreatePrescriptionItemDto>
    {
        public CreatePrescriptionItemDtoValidator()
        {
            RuleFor(x => x.MedicineId)
                .GreaterThan(0)
                .WithMessage("Derman seçilməlidir!");
            RuleFor(x => x.Dosage)
                .NotEmpty()
                .WithMessage("Dozalanma qeyd edilməlidir!");
            RuleFor(x => x.Duration)
                .NotEmpty()
                .WithMessage("Müddət qeyd edilməlidir!");
            RuleFor(x => x.Quantity)
                .GreaterThan(0)
                .WithMessage("Say qeyd edilməlidir!");
        }
    }
}
