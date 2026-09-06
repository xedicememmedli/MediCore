using MediCore.Business.DTOs.BasketItem;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Basket
{
    public record GetBasketDto
    {
        public int Id { get; set; }
        public string AppUserId { get; set; }
        public decimal TotalPrice { get; set; } // Sebetin yekun qiymeti

        public List<GetBasketItemDto> BasketItems { get; set; } = new List<GetBasketItemDto>();

    }
}
