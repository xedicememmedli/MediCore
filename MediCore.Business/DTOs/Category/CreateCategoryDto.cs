using FluentValidation;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Category
{
    public record CreateCategoryDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public IFormFile Photo { get; set; }

    }

    public class CreateCategoryDtoValidator:AbstractValidator<CreateCategoryDto>
    {
        public CreateCategoryDtoValidator() 
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Name-i düzgün doldurun")
                .NotNull()
                .WithMessage("Name-i düzgün doldurun")
                .MaximumLength(20)
                .WithMessage("Uzunluq max 20 ola bilər");


            RuleFor(x => x.Description)
                 .NotEmpty().WithMessage("Description boş ola bilməz")
                 .MaximumLength(500).WithMessage("Description çox uzundur");


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
