using FluentValidation;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Specialty
{
    public record CreateSpecialtyDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public IFormFile Photo { get; set; }
    }

    public class CreateSpecialtyDtoValidator : AbstractValidator<CreateSpecialtyDto>
    {
        public CreateSpecialtyDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Ixtisas adı boş ola bilməz")
                .NotNull()
                .WithMessage("Ixtisas adı daxil edilməlidir")
                .MaximumLength(50)
                .WithMessage("Uzunluq maksimum 50 simvol ola bilər");

            RuleFor(x => x.Description)
                .MaximumLength(200)
                .WithMessage("Açıqlama maksimum 200 simvol ola bilər");

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
