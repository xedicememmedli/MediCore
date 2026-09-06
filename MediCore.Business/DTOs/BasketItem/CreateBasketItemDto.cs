using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;

namespace MediCore.Business.DTOs.BasketItem
{

    public record CreateBasketItemDto
    {
        public int MedicineId { get; set; }
        public int Count { get; set; }
    }

    public class CreateBasketItemDtoValidator : AbstractValidator<CreateBasketItemDto>
    {
        public CreateBasketItemDtoValidator()
        {
            RuleFor(x => x.MedicineId)
                .GreaterThan(0)
                .WithMessage("Dərman seçilməlidir (Id 0-dan böyük olmalıdır)");

            RuleFor(x => x.Count)
                .GreaterThan(0)
                .WithMessage("Dərman sayı ən azı 1 olmalıdır")
                .LessThanOrEqualTo(10)
                .WithMessage("Bir dəfəyə maksimum 10 ədəd eyni dərmandan ala bilərsiniz");
        }
    }
}
