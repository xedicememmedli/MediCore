using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Medicine
{
    public record GetAllMedicineDto
    {
        public IQueryable<GetMedicineDto> Medicines { get; set; }
    }
}
