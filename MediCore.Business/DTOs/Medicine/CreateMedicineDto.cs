using FluentValidation;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace MediCore.Business.DTOs.Medicine
{
    public record CreateMedicineDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int StockCount { get; set; }
        public IFormFile Photo { get; set; }
        public DateTime ExpireDate { get; set; }
        public List<int> CategoryIds { get; set; }
        public string ActiveIngredient { get; set; } // Tesiredici madde (Alternativ axtaris ucun)
        public bool IsPrescriptionRequired { get; set; } // Resept lazimdirmi? (True/False)
    }

    public class CreateMedicineDtoValidator : AbstractValidator<CreateMedicineDto>
    {
        public CreateMedicineDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name-i duzgun doldurun")
                .NotNull().WithMessage("Name-i duzgun doldurun")
                .MaximumLength(100).WithMessage("Uzunluq max 100 ola biler");

            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Qiymet 0-dan boyuk olmalidir");

            RuleFor(x => x.StockCount)
                .GreaterThanOrEqualTo(0).WithMessage("Stokda qalan say menfi ola bilmez");

            RuleFor(x => x.ExpireDate)
                .GreaterThan(DateTime.UtcNow).WithMessage("Son istifade tarixi kecmis derman elave edile bilmez");

            RuleFor(x => x.CategoryIds)
                .NotEmpty().WithMessage("Derman en azi bir kategoriyaya aid olmalidir");

            RuleFor(x => x.ActiveIngredient)
                .NotEmpty().WithMessage("Tesiredici madde bos ola bilmez")
                .NotNull().WithMessage("Tesiredici madde bos ola bilmez")
                .MaximumLength(200).WithMessage("Tesiredici maddenin adi cox uzundur");

            RuleFor(x => x.Photo)
              .NotNull().WithMessage("Şəkil yükləmək məcburidir.")
              .Must(IsUnderSizeLimit).WithMessage("Şəklin ölçüsü maksimum 2MB ola bilər.")
              .Must(IsImageFile).WithMessage("Yalnız şəkil formatında fayl yükləyə bilərsiniz.");
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