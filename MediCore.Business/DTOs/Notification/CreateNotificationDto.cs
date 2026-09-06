using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Notification
{
    public record CreateNotificationDto
    {
        public string AppUserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public int? OrderId { get; set; }
    }

    public class CreateNotificationDtoValidator : AbstractValidator<CreateNotificationDto>
    {
        public CreateNotificationDtoValidator()
        {
            RuleFor(x => x.AppUserId)
                .NotEmpty().WithMessage("İstifadəçi seçilməlidir.")
                .NotNull().WithMessage("İstifadəçi seçilməlidir.");

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Başlıq boş ola bilməz.")
                .MaximumLength(255).WithMessage("Başlıq maksimum 255 simvol ola bilər.");

            RuleFor(x => x.Message)
                .NotEmpty().WithMessage("Mesaj məzmunu boş ola bilməz.")
                .MaximumLength(1000).WithMessage("Mesaj maksimum 1000 simvol ola bilər.");
        }
    }
}
