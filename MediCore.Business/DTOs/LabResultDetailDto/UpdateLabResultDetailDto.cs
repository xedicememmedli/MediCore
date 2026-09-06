using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.LabResultDetailDto
{
    public record UpdateLabResultDetailDto
    {
        public int Id { get; set; } 
        public string ParameterName { get; set; }
        public string Value { get; set; }
        public string Unit { get; set; }
        public string ReferenceRange { get; set; }
        public bool IsCritical { get; set; }
    }

    public class UpdateLabResultDetailDtoValidator : AbstractValidator<UpdateLabResultDetailDto>
    {
        public UpdateLabResultDetailDtoValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("Detal ID düzgün deyil!");
            RuleFor(x => x.ParameterName).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Value).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Unit).MaximumLength(50);
            RuleFor(x => x.ReferenceRange).MaximumLength(100);
        }
    }
}
