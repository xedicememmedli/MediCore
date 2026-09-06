using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Payment
{
    public record GetAllPaymentDto
    {
        public int Id { get; set; }
        public string AppUserId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Status { get; set; }
        public DateTime PaymentDate { get; set; }
    }
}
