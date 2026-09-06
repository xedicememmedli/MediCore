using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.PrescriptionItem
{
    public record UpdatePrescriptionItemDto
    {
        // Eger movcud dermani yenileyirikse ID-si olacaq
        // Eger update zamani yeni derman elave edirikse ID 0 ola biler
        public int Id { get; set; }

        public int MedicineId { get; set; }
        public string Dosage { get; set; }
        public string Duration { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdatePrescriptionItemDtoValidator : AbstractValidator<UpdatePrescriptionItemDto>
    {
        public UpdatePrescriptionItemDtoValidator()
        {
            RuleFor(x => x.MedicineId)
                .GreaterThan(0)
                .WithMessage("Dərman seçilməlidir!");
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
