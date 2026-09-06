using FluentValidation;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Category
{
    public record UpdateCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public IFormFile? Photo { get; set; }
    }
    public class UpdateCategoryDtoValidator:AbstractValidator<UpdateCategoryDto>
    {
        public UpdateCategoryDtoValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .NotNull();
            RuleFor(x => x.Name)
                .NotEmpty()
                .NotNull()
                .MaximumLength(20);


            RuleFor(x => x.Description)
               .NotEmpty().WithMessage("Description boş ola bilməz")
               .MaximumLength(500).WithMessage("Description çox uzundur");


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
