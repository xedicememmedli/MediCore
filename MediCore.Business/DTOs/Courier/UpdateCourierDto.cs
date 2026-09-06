using FluentValidation;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Courier
{
    public record UpdateCourierDto
    {
        public IFormFile? Photo { get; set; }
        public int Id { get; set; }
        public string AppUserId { get; set; }
        public string VehicleType { get; set; } = string.Empty;
        public string VehiclePlateNumber { get; set; }
    }

    public class UpdateCourierDtoValidator : AbstractValidator<UpdateCourierDto>
    {
        public UpdateCourierDtoValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("ID duzgun deyil");

            RuleFor(x => x.AppUserId)
                .NotEmpty()
                .WithMessage("Istifadeçi ID boş ola bilməz");

            RuleFor(x => x.VehicleType)
                .NotEmpty()
                .WithMessage("Nəqliyyat növü daxil edilməlidir")
                .MaximumLength(50)
                .WithMessage("Maksimum 50 simvol ola bilər");

            RuleFor(x => x.VehiclePlateNumber)
                .NotEmpty()
                .WithMessage("Nömrə nişani daxil edilməlidir")
                .MaximumLength(20)
                .WithMessage("Maksimum 20 simvol ola bilər");

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
