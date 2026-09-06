using FluentValidation;
using MediCore.Business.DTOs.LabResultDetailDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.LabResult
{
    public record CreateLabResultDto
    {
        public string PatientId { get; set; }
        public int? DoctorId { get; set; }
        public string TestCategory { get; set; } // Məs: Ümumi Qan Analizi
        public List<CreateLabResultDetailDto> Details { get; set; }
    }

    public class CreateLabResultDtoValidator : AbstractValidator<CreateLabResultDto>
    {
        public CreateLabResultDtoValidator()
        {
            RuleFor(x => x.PatientId)
                .NotEmpty()
                .WithMessage("Pasiyent seçilməlidir!");

            RuleFor(x => x.TestCategory)
                .NotEmpty()
                .WithMessage("Test kateqoriyası boş ola bilməz!")
                .MaximumLength(100)
                .WithMessage("Kateqoriya adı maksimum 100 simvol ola bilər!");

            RuleFor(x => x.Details)
                .NotEmpty()
                .WithMessage("Analizdə ən azı 1 detal (göstərici) olmalıdır!");

            RuleForEach(x => x.Details)
                .SetValidator(new CreateLabResultDetailDtoValidator());
        }
    }
}
