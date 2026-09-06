using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Specialty
{
    public record GetAllSpecialtyDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
