using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Payment
{
    public record UpdatePaymentDto
    {
        public int Id { get; set; }
        public string Status { get; set; } // "Pending", "Completed", "Failed"
        public string? TransactionId { get; set; }
    }

    public class UpdatePaymentDtoValidator : AbstractValidator<UpdatePaymentDto>
    {
        public UpdatePaymentDtoValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("ID boş ola bilməz")
                .NotNull().WithMessage("ID boş ola bilməz")
                .GreaterThan(0).WithMessage("ID 0-dan böyük olmalıdır");

            RuleFor(x => x.Status)
                .NotEmpty().WithMessage("Status boş ola bilməz")
                .NotNull().WithMessage("Status boş ola bilməz")
                .MaximumLength(50).WithMessage("Status max 50 simvol ola bilər");
        }
    }
}
