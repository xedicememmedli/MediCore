using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Prescription
{
    public record GetAllPrescriptionDto
    {
        public int Id { get; set; }
        public int ConsultationId { get; set; }
        public string DoctorName { get; set; }
        public string PatientName { get; set; }
        public DateTime CreatedAt { get; set; }
        public int MedicineCount { get; set; }
    }
}
