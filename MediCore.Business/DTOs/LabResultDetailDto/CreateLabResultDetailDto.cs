using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.LabResultDetailDto
{
    public record CreateLabResultDetailDto
    {
        public string ParameterName { get; set; } // Məs: Qlükoza
        public string Value { get; set; } // Məs: 120
        public string Unit { get; set; } // Məs: mg/dL
        public string ReferenceRange { get; set; } // Məs: 70-110
        public bool IsCritical { get; set; } // Təhlükəlidirsə true
    }

    public class CreateLabResultDetailDtoValidator : AbstractValidator<CreateLabResultDetailDto>
    {
        public CreateLabResultDetailDtoValidator()
        {
            RuleFor(x => x.ParameterName)
                .NotEmpty()
                .WithMessage("Parametr adı boş ola bilməz!")
                .MaximumLength(100)
                .WithMessage("Parametr adı çox uzundur!");

            RuleFor(x => x.Value)
                .NotEmpty()
                .WithMessage("Nəticə dəyəri boş ola bilməz!")
                .MaximumLength(100)
                .WithMessage("Dəyər çox uzundur!");

            RuleFor(x => x.Unit)
                
                .MaximumLength(50)
                .WithMessage("Ölçü vahidi çox uzundur!");
            RuleFor(x => x.ReferenceRange)
                .MaximumLength(100)
                .WithMessage("İstinad aralığı çox uzundur!");
        }
    }
}
