using MediCore.Business.DTOs.Category;
using MediCore.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Medicine
{
    public record GetMedicineDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int StockCount { get; set; }
        public string ImageUrl { get; set; }
        public DateTime ExpireDate { get; set; }
        public string ActiveIngredient { get; set; } // Tesiredici madde
        public bool IsPrescriptionRequired { get; set; } // Resept lazimdirmi? (Ekranda "Yalniz reseptle" yazmaq ucun)

        public List<GetCategoryDto> Categories { get; set; }
    }
}