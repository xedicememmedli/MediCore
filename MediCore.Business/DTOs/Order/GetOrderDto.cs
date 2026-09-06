using MediCore.Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Order
{
    public record GetOrderDto
    {
        public int Id { get; set; }
        public string ShippingAddress { get; set; }
        public string PhoneNumber { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } // OrderStatus enum-un string adi
        public DateTime CreatedAt { get; set; }
        public List<GetOrderItemDto> OrderItems { get; set; } = new List<GetOrderItemDto>();
        public int? CourierId { get; set; }
        public MediCore.Core.Enums.DeliveryType DeliveryType { get; set; }
    }
}
