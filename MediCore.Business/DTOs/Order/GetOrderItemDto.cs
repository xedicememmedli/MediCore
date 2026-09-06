using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Order
{
    public record GetOrderItemDto
    {
        public string MedicineName { get; set; }
        public decimal UnitPrice { get; set; }
        public int Count { get; set; }
    }
}
