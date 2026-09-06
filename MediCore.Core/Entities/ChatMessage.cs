using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class ChatMessage : BaseEntity
    {
        // Hansi konsultasiyaya (otaga) aiddir?
        public int ConsultationId { get; set; }

        public Consultation Consultation { get; set; } = null!;

        // Mesaji kim gonderib? (Xeste yoxsa Hekim?)
        public string SenderId { get; set; } = null!;
        public string ReceiverId { get; set; } = null!;

        public AppUser Sender { get; set; } = null!;
        public AppUser Receiver { get; set; } = null!;

        public string Message { get; set; } = null!; // Mesajin metni
        public bool IsRead { get; set; } = false; // Oxunub yoxsa yox?
    }
}
