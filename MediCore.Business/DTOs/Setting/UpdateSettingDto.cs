using FluentValidation;

namespace MediCore.Business.DTOs.Setting;

public record UpdateSettingDto
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

public class UpdateSettingDtoValidator : AbstractValidator<UpdateSettingDto>
{
    public UpdateSettingDtoValidator()
    {
        RuleFor(s => s.Id)
            .NotNull().WithMessage("Boş ola bilməz");

        RuleFor(s => s.Key)
            .NotNull().WithMessage("Boş ola bilməz")
            .NotEmpty().WithMessage("Boş ola bilməz")
            .MinimumLength(3).WithMessage("3den böyük")
            .MaximumLength(256).WithMessage("256dan kiçik");

        RuleFor(s => s.Value)
            .NotNull().WithMessage("Boş ola bilməz")
            .NotEmpty().WithMessage("Boş ola bilməz")
            .MinimumLength(3).WithMessage("3den böyük")
            .MaximumLength(1024).WithMessage("1024den kiçik");

    }
}
