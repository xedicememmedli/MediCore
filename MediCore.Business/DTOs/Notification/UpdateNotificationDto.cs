using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Notification
{
    public record UpdateNotificationDto
    {
        public int Id { get; set; }
        public bool IsRead { get; set; }
    }

    public class UpdateNotificationDtoValidator : AbstractValidator<UpdateNotificationDto>
    {
        public UpdateNotificationDtoValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0).WithMessage("Keçərli bir bildiriş ID-si göndərin.");
        }
    }
}
