using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class UsedPrescription : BaseEntity 
    {
        public int? PrescriptionId { get; set; }
        public string? DocumentNumber { get; set; }
        public Prescription Prescription { get; set; }

        public string AppUserId { get; set; } // Hansı müştəri istifadə edib
        public AppUser AppUser { get; set; }

        public int MedicineId { get; set; } // Hansı dərman üçün istifadə edilib
        public Medicine Medicine { get; set; }

        public int TotalAllowedQuantity { get; set; } // Reseptdə icazə verilən maksimum say (məs: 3)
        public int UsedQuantity { get; set; } // Müştəri indiyə qədər neçəsini alıb (məs: 2)

        public bool IsFullyUsed => UsedQuantity >= TotalAllowedQuantity; // Limit dolubmu?
    }
}
