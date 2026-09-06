using FluentValidation;

namespace MediCore.Business.DTOs.UsedPrescription
{
    public class UsedPrescriptionCreateDto
    {
        public int? PrescriptionId { get; set; }
        public string? DocumentNumber { get; set; }
        public string AppUserId { get; set; }
        public int MedicineId { get; set; }
        public int TotalAllowedQuantity { get; set; }
        public int RequestedQuantity { get; set; }
    }

    public class UsedPrescriptionCreateDtoValidator : AbstractValidator<UsedPrescriptionCreateDto>
    {
        public UsedPrescriptionCreateDtoValidator()
        {
            // DÜZƏLIŞ: PrescriptionId nullable (int?) tipdir — null gəldikdə
            // GreaterThan(0) birbaşa tətbiq olunarsa "null > 0 = false" sayılır və
            // hər null göndərişdə validation uğursuz olurdu.
            // .When(x => x.PrescriptionId.HasValue) əlavə edildi.
            RuleFor(x => x.PrescriptionId)
                .GreaterThan(0)
                .WithMessage("Resept ID düzgün deyil (sıfırdan böyük olmalıdır)!")
                .When(x => x.PrescriptionId.HasValue);

            RuleFor(x => x.AppUserId)
                .NotEmpty().WithMessage("İstifadəçi seçilməlidir!");

            RuleFor(x => x.MedicineId)
                .GreaterThan(0).WithMessage("Dərman seçilməlidir!");

            // DÜZƏLIŞ: Bu iki sahə validasiya edilmirdi — 0 və ya mənfi dəyər göndərilə bilərdi
            RuleFor(x => x.TotalAllowedQuantity)
                .GreaterThan(0).WithMessage("Ümumi icazə verilən say 0-dan böyük olmalıdır!");

            RuleFor(x => x.RequestedQuantity)
                .GreaterThan(0).WithMessage("İstənilən say 0-dan böyük olmalıdır!")
                .LessThanOrEqualTo(x => x.TotalAllowedQuantity)
                .WithMessage("İstənilən say, ümumi icazə verilən saydan çox ola bilməz!");
        }
    }
}
