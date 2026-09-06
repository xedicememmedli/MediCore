using MediCore.Business.DTOs.BasketItem;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Basket
{
    public record GetAllBasketDto
    {
        public int Id { get; set; }
        public string AppUserId { get; set; }
        public decimal TotalPrice { get; set; }
        public List<GetBasketItemDto> BasketItems { get; set; } = new List<GetBasketItemDto>();
    }
}
