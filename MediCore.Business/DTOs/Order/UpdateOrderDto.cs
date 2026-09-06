using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Order
{
    public record UpdateOrderDto
    {
        public int Id { get; set; }
        public int? CourierId { get; set; } // Kuryer teyin etmek ucun (nullable ola biler)
        public string ShippingAddress { get; set; } // Eger unvan yenilenirse
       
    }

    public class UpdateOrderDtoValidator : AbstractValidator<UpdateOrderDto>
    {
        public UpdateOrderDtoValidator()
        {
            RuleFor(x => x.Id).GreaterThan(0).WithMessage("Sifariş ID düzgün deyil");

            // Kuryer secilibse, ID-nin 0-dan boyuk oldugunu yoxla
            RuleFor(x => x.CourierId)
                .GreaterThan(0).When(x => x.CourierId.HasValue)
                .WithMessage("Kuryer ID düzgün deyil");
        }
    }
}
