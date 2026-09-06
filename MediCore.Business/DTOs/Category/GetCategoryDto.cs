using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Category
{
    public record GetCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; } 
        public string IconPath { get; set; }    
    }
}
