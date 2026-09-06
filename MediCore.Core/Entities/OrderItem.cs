using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class OrderItem : BaseEntity
    {
        public int OrderId { get; set; }
        public Order Order { get; set; }

        public int MedicineId { get; set; }
        public Medicine Medicine { get; set; }

        public decimal UnitPrice { get; set; } // Sifaris olunan andaki qiymet
        public int Count { get; set; }
    }
}
