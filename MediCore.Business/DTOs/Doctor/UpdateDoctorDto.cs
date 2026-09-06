using FluentValidation;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Doctor
{
    public record UpdateDoctorDto
    {
        public IFormFile? Photo { get; set; }
        public int Id { get; set; }
        public string AppUserId { get; set; }
        public int SpecialtyId { get; set; }
        public decimal ConsultationFee { get; set; }
        public string Experience { get; set; }
        public string Education { get; set; }
        public string? WorkingHours { get; set; }
        public string? Biography { get; set; }
    }

    public class UpdateDoctorDtoValidator : AbstractValidator<UpdateDoctorDto>
    {
        public UpdateDoctorDtoValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("ID düzgün deyil");

            RuleFor(x => x.AppUserId)
                .NotEmpty()
                .WithMessage("İstifadəçi ID boş ola bilməz");

            RuleFor(x => x.SpecialtyId)
                .GreaterThan(0)
                .WithMessage("Düzgün ixtisas seçin");

            RuleFor(x => x.ConsultationFee)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Qiymət mənfi ola bilməz");

            RuleFor(x => x.Experience)
                .MaximumLength(500)
                .WithMessage("Təcrübə hissəsi çox uzundur");

            RuleFor(x => x.Education)
                .MaximumLength(500)
                .WithMessage("Təhsil hissəsi çox uzundur");

            RuleFor(x => x.Biography)
                .MaximumLength(2000)
                .WithMessage("Bioqrafiya 2000 simvoldan çox ola bilməz");

            RuleFor(x => x.WorkingHours)
                .MaximumLength(100)
                .WithMessage("İş saatları formatı çox uzundur");

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