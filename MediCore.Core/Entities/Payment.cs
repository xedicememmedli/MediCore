using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class Payment : BaseEntity 
    {
        public string AppUserId { get; set; } = null!;
        public AppUser AppUser { get; set; } = null!; 

        public decimal Amount { get; set; }
        public string Currency { get; set; } = "AZN"; 
        public string Status { get; set; } = "Pending"; // Pending, Completed, Failed
        public string? TransactionId { get; set; } // Odenis sisteminden gelen qebz/kod
        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    }
}
