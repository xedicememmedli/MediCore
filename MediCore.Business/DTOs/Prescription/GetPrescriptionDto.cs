using MediCore.Business.DTOs.PrescriptionItem;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Prescription
{
    public record GetPrescriptionDto
    {
        public int Id { get; set; }
        public int ConsultationId { get; set; }
        public string Instructions { get; set; }
        public DateTime CreatedAt { get; set; }
        public string PatientName { get; set; }
        public string DoctorName { get; set; }

        // Reseptin icindeki dermanlarin siyahisi
        public List<GetPrescriptionItemDto> Items { get; set; }
    }
}
