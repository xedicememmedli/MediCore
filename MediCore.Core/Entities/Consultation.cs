using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class Consultation : BaseEntity
    {
        // Xeste (Patient) elaqesi
        public string PatientId { get; set; } = null!;
        public AppUser Patient { get; set; } = null!;

        // Hekim (Doctor) elaqesi
        public int DoctorId { get; set; }
        public Doctor Doctor { get; set; } = null!;

        public bool IsActive { get; set; } = true; // Sohbet aciqdir (true) ve ya bitib (false)?
        public DateTime ScheduledTime { get; set; }

        // Relational Properties (Sohbetin icindeki mesajlar ve yazilan reseptler)
        public bool IsPendingRefund { get; set; } = false;
        public DateTime? CancelledAt { get; set; }
        public decimal PaidAmount { get; set; } = 0;
        public ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();
        public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    }
}



