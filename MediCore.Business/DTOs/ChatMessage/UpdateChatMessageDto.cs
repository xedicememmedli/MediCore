using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.ChatMessage
{
    public record UpdateChatMessageDto
    {
        public int Id { get; set; }
        public string Message { get; set; }
    }

    public class UpdateChatMessageDtoValidator : AbstractValidator<UpdateChatMessageDto>
    {
        public UpdateChatMessageDtoValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("ID düzgün deyil");

            RuleFor(x => x.Message)
                .NotEmpty()
                .WithMessage("Mesaj mətni boş ola bilməz")
                .MaximumLength(1000)
                .WithMessage("Mesaj çox uzundur");
        }
    }
}
