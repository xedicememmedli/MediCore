using FluentValidation;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Courier
{
    public record CreateCourierDto
    {
        public IFormFile Photo { get; set; }
        public string AppUserId { get; set; }
        public string VehicleType { get; set; } = string.Empty;
        public string VehiclePlateNumber { get; set; }
    }

    public class CreateCourierDtoValidator : AbstractValidator<CreateCourierDto>
    {
        public CreateCourierDtoValidator()
        {
            RuleFor(x => x.VehicleType)
                .NotEmpty()
                .MaximumLength(50);

            RuleFor(x => x.VehiclePlateNumber)
                .NotEmpty()
                .MaximumLength(20);

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
