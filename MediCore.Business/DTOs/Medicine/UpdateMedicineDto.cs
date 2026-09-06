using FluentValidation;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Medicine
{
    public record UpdateMedicineDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int StockCount { get; set; }
        public IFormFile? Photo { get; set; }
        public DateTime ExpireDate { get; set; }
        public List<int> CategoryIds { get; set; }  // Dermanin categorylarini yenileyir
        public string ActiveIngredient { get; set; } // Tesiredici madde
        public bool IsPrescriptionRequired { get; set; } // Resept lazimdirmi?
    }

    public class UpdateMedicineDtoValidator : AbstractValidator<UpdateMedicineDto>
    {
        public UpdateMedicineDtoValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .NotNull();

            RuleFor(x => x.Name)
                .NotEmpty()
                .NotNull()
                .MaximumLength(100);

            RuleFor(x => x.Price)
                .GreaterThan(0);

            RuleFor(x => x.StockCount)
                .GreaterThanOrEqualTo(0);

            RuleFor(x => x.ExpireDate)
                .GreaterThan(DateTime.UtcNow);

            RuleFor(x => x.CategoryIds)
                .NotEmpty()
                .NotNull();

            RuleFor(x => x.ActiveIngredient)
                .NotEmpty()
                .NotNull()
                .MaximumLength(200);

            RuleFor(x => x.Photo)
                    .Must(IsUnderSizeLimit).WithMessage("Şəklin ölçüsü maksimum 2MB ola bilər.")
                   .Must(IsImageFile).WithMessage("Yalnız şəkil formatında fayl yükləyə bilərsiniz.")
                   .When(x => x.Photo != null);
        }

        private bool IsUnderSizeLimit(IFormFile file)
        {
            if (file == null) return false;
            return file.Length <= 2 * 1024 * 1024;
        }

        private bool IsImageFile(IFormFile file)
        {
            if (file == null) return false;
            return file.ContentType.StartsWith("image/");
        }
    }
}