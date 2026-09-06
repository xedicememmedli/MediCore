using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.User
{
    public record LoginDto
    {
        public string UserName { get; set; }
        public string Password { get; set; }
    }
    public class LoginDtoValidator : AbstractValidator<LoginDto>
    {
        public LoginDtoValidator()
        {
            RuleFor(u => u.UserName)
                .NotNull()
               .NotEmpty();
            RuleFor(u => u.Password)
             .NotNull()
             .NotEmpty()
             .MinimumLength(6)
             .WithMessage("UserName və ya Password səhvdir");
        }
    }
}
