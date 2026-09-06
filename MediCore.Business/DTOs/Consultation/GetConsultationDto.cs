using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Consultation
{
    public record GetConsultationDto
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public string PatientId { get; set; }
        public DateTime ScheduledDate { get; set; }
    }
}
