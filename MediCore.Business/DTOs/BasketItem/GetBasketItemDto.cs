using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.BasketItem
{
    public record GetBasketItemDto
    {
        public int Id { get; set; }
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } // Mapper bunu avtomatik Medicine cedvelinden tapacaq
        public decimal UnitPrice { get; set; }
        public int Count { get; set; }
        public decimal TotalItemPrice { get; set; } // UnitPrice * Count
    }
}
