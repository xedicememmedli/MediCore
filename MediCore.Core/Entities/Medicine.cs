using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class Medicine : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; } // Terkibi ve ya istifade qaydasi
        public decimal Price { get; set; }      // Qiymeti
        public int StockCount { get; set; }     // Anbarda nece dene qalib?
        public string? ImageUrl { get; set; }
        public string? ImagePublicId { get; set; }
        public DateTime ExpireDate { get; set; } // Son istifade tarixi 
        public string AppUserId { get; set; }
        public string ActiveIngredient { get; set; } // Tesiredici madde
        public bool IsPrescriptionRequired { get; set; } = false; // Dərman resept tələb edirmi?
        public AppUser User { get; set; }
        public ICollection<MedicinesCategories> MedicinesCategories { get; set; } = new List<MedicinesCategories>();
        public ICollection<PrescriptionItem> PrescriptionItems { get; set; } = new List<PrescriptionItem>();
       
    }
}
