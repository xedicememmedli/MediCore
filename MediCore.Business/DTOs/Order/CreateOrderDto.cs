using FluentValidation;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Order
{
    public record CreateOrderDto
    {
        public string ShippingAddress { get; set; }
        public string PhoneNumber { get; set; }
        public IFormFile? PrescriptionPhoto { get; set; }
        public MediCore.Core.Enums.DeliveryType DeliveryType { get; set; }
    }

    public class CreateOrderDtoValidator : AbstractValidator<CreateOrderDto>
    {
        public CreateOrderDtoValidator()
        {
            RuleFor(x => x.ShippingAddress)
               .NotEmpty().WithMessage("Çatdirilma ünvani qeyd edilm?lidir.")
               .MinimumLength(10).WithMessage("Z?hm?t olmasa daha ?trafli ünvan daxil edin (min. 10 simvol).")
               .MaximumLength(500).WithMessage("Unvan cox uzundur.");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Telefon nömresi qeyd edilm?lidir.")
                .Matches(@"^\+?[0-9]{10,15}$").WithMessage("Z?hm?t olmasa düzgün telefon nömr?si daxil edin (mes. +994501234567).");
        }
    }
}
