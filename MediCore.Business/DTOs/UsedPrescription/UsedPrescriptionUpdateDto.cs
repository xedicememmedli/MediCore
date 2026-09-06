using FluentValidation;

namespace MediCore.Business.DTOs.UsedPrescription
{
    public class UsedPrescriptionUpdateDto
    {
        public int Id { get; set; }
        public int? PrescriptionId { get; set; }
        public string? DocumentNumber { get; set; }
        public string AppUserId { get; set; }
        public int MedicineId { get; set; }
        public int TotalAllowedQuantity { get; set; }
        public int UsedQuantity { get; set; }
    }

    public class UsedPrescriptionUpdateDtoValidator : AbstractValidator<UsedPrescriptionUpdateDto>
    {
        public UsedPrescriptionUpdateDtoValidator()
        {
            // DÜZƏLIŞ: Id heç validasiya edilmirdi — 0 və ya mənfi ID göndərilə bilərdi
            RuleFor(x => x.Id)
                .GreaterThan(0).WithMessage("ID düzgün deyil!");

            // DÜZƏLIŞ: Eyni nullable int? problemi — When əlavə edildi
            RuleFor(x => x.PrescriptionId)
                .GreaterThan(0)
                .WithMessage("Resept ID düzgün deyil (sıfırdan böyük olmalıdır)!")
                .When(x => x.PrescriptionId.HasValue);

            RuleFor(x => x.AppUserId)
                .NotEmpty().WithMessage("İstifadəçi seçilməlidir!");

            RuleFor(x => x.MedicineId)
                .GreaterThan(0).WithMessage("Dərman seçilməlidir!");

            RuleFor(x => x.TotalAllowedQuantity)
                .GreaterThan(0).WithMessage("Ümumi icazə verilən say 0-dan böyük olmalıdır!");

            RuleFor(x => x.UsedQuantity)
                .GreaterThanOrEqualTo(0).WithMessage("İstifadə edilən say mənfi ola bilməz!")
                .LessThanOrEqualTo(x => x.TotalAllowedQuantity)
                .WithMessage("İstifadə edilən say, ümumi icazə verilən saydan çox ola bilməz!");
        }
    }
}
