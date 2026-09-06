using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Doctor
{
    public record GetAllDoctorDto
    {
        public string Name { get; set; }
        public int Id { get; set; }
        public string AppUserId { get; set; }
        public string Experience { get; set; }
        public string Education { get; set; }
        public decimal ConsultationFee { get; set; }

        public string? WorkingHours { get; set; }
        public string? Biography { get; set; }

        public int SpecialtyId { get; set; }
        public string SpecialtyName { get; set; } 
    }
}
