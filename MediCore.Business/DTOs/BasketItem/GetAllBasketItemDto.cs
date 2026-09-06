using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.BasketItem
{
    public record GetAllBasketItemDto
    {
        public int Id { get; set; }
        public int MedicineId { get; set; }
        public string MedicineName { get; set; }
        public decimal UnitPrice { get; set; }
        public int Count { get; set; }
        public decimal TotalItemPrice { get; set; }
    }
}
