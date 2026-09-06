using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.PrescriptionItem
{
    public record GetPrescriptionItemDto
    {
        public int Id { get; set; }
        public int MedicineId { get; set; }

        // Dermanin adi (Front-end-de gostermek ucun vacibdir)
        public string MedicineName { get; set; }

        public string Dosage { get; set; }
        public string Duration { get; set; }
        public int Quantity { get; set; }
    }
}
