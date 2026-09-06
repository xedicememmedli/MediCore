using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Payment
{
    public record CreatePaymentDto
    {
        public string AppUserId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "AZN";
    }

    public class CreatePaymentDtoValidator : AbstractValidator<CreatePaymentDto>
    {
        public CreatePaymentDtoValidator()
        {
            RuleFor(x => x.AppUserId)
                .NotEmpty().WithMessage("İstifadəçi ID boş ola bilməz")
                .NotNull().WithMessage("İstifadəçi ID boş ola bilməz");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Ödəniş məbləği 0-dan böyük olmalıdır");

            RuleFor(x => x.Currency)
                .NotEmpty().WithMessage("Valyuta boş ola bilməz")
                .NotNull().WithMessage("Valyuta boş ola bilməz")
                .MaximumLength(3).WithMessage("Valyuta max 3 simvol ola bilər (məs. AZN)");
        }
    }
}
