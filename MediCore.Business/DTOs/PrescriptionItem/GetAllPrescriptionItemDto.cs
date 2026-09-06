using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.PrescriptionItem
{
    public record GetAllPrescriptionItemDto
    {
        public int Id { get; set; }

        // Bu dermanin hansi reseptden (ve dolayisiyla hansi xesteden) geldiyini bilmek ucun
        public int PrescriptionId { get; set; }

        public int MedicineId { get; set; }

        // Ekranda dermanin ID-si yox, adi gorunmelidir
        public string MedicineName { get; set; }

        public string Dosage { get; set; }
        public string Duration { get; set; }
        public int Quantity { get; set; }
    }
}
