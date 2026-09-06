using MediCore.Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Order
{
    public record UpdateOrderStatusDto
    {
        public int Id { get; set; }
        public OrderStatus Status { get; set; } // Yeni statusu gonderirik
    }
}
