using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.User
{
    public record RegisterDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
        public string Role { get; set; }
        public string? InsuranceNumber { get; set; }
    }

    public class RegisterDtoValidator:AbstractValidator<RegisterDto>
    {
        public RegisterDtoValidator() 
        {
            RuleFor(u => u.Name)
                .NotNull()
                .NotEmpty()
                .MinimumLength(3)
                .MaximumLength(50);
            RuleFor(u => u.UserName)
                 .NotNull()
                .NotEmpty()
                .MinimumLength(4)
                .MaximumLength(50);
            RuleFor(u => u.Email)
                .NotNull()
                .NotEmpty()
                .Must(x =>
                {
                    Regex regex = new Regex("^[a-z0-9]+(?!.*(?:\\+{2,}|\\-{2,}|\\.{2,}))(?:[\\.+\\-]{0,1}[a-z0-9])*@gmail\\.com$");
                    var math=regex.Match(x);
                    return math.Success;    
                });
            RuleFor(u => u.Password)
                .NotNull()
                .NotEmpty()
                .MinimumLength(4);
            RuleFor(u => u)
                .Must(u => u.Password == u.ConfirmPassword);


        }
    }
}

