using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Category
{
    public record GetAllCategoryDto
    {
        public IQueryable<GetCategoryDto>Categories { get; set; }
    }
}
