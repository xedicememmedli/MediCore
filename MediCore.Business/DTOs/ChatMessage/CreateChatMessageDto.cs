using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.ChatMessage
{
    public record CreateChatMessageDto
    {
        public int ConsultationId { get; set; }
        public string SenderId { get; set; } // Mesaji GONDERENIN ID-si
        public string ReceiverId { get; set; }
        public string Message { get; set; }
    }

    public class CreateChatMessageDtoValidator : AbstractValidator<CreateChatMessageDto>
    {
        public CreateChatMessageDtoValidator()
        {
            RuleFor(x => x.ConsultationId)
                .GreaterThan(0);
            RuleFor(x => x.Message)
                .NotEmpty()
                .MaximumLength(1000);
        }
    }
}
