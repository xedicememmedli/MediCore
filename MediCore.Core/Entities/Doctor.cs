using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class Doctor : BaseEntity
    {
        public string? ImageUrl { get; set; }
        public string? ImagePublicId { get; set; }
        // Hekimin User hesabi ile elaqesi
        public string AppUserId { get; set; } = null!;
        public AppUser AppUser { get; set; } = null!;

        // Hekimin ixtisasi ile elaqesi
        public int SpecialtyId { get; set; }
        public Specialty Specialty { get; set; } = null!;
        public string Experience { get; set; } // Tecrubesi
        public string Education { get; set; }  
        public decimal ConsultationFee { get; set; } 
        public string? WorkingHours { get; set; } // Is saatlari 
        public string? Biography { get; set; } // Hekim haqqinda qisa melumat
        public ICollection<Consultation> Consultations { get; set; } = new List<Consultation>();
    }
}
