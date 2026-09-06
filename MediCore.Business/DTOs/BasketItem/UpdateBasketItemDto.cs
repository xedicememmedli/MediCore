using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;

namespace MediCore.Business.DTOs.BasketItem
{
   

    public record UpdateBasketItemDto
    {
        public int Id { get; set; }
        public int Count { get; set; }
    }

    public class UpdateBasketItemDtoValidator : AbstractValidator<UpdateBasketItemDto>
    {
        public UpdateBasketItemDtoValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("Id 0-dan büyük olmalıdır");

            RuleFor(x => x.Count)
                .GreaterThan(0)
                .WithMessage("Dərman sayı ən azı 1 olmalıdır")
                .LessThanOrEqualTo(10)
                .WithMessage("Maksimum 10 ədəd secə bilərsiniz");
        }
    }
}
