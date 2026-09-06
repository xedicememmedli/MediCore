using FluentValidation;
using MediCore.Business.DTOs.LabResultDetailDto;
using MediCore.Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.LabResult
{
    public record UpdateLabResultDto
    {
        public int Id { get; set; }
        public LabResultStatus Status { get; set; }
        public string? PdfResultUrl { get; set; }
        public List<UpdateLabResultDetailDto> Details { get; set; }
    }

    public class UpdateLabResultDtoValidator : AbstractValidator<UpdateLabResultDto>
    {
        public UpdateLabResultDtoValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("Analiz ID düzgün deyil!");
            RuleFor(x => x.Status)
                .IsInEnum()
                .WithMessage("Daxil edilən status düzgün deyil!");

            RuleFor(x => x.Details)
                .NotEmpty()
                .WithMessage("Analizdə ən azı 1 detal olmalıdır!");

            RuleForEach(x => x.Details)
                .SetValidator(new UpdateLabResultDetailDtoValidator());
        }
    }
}
