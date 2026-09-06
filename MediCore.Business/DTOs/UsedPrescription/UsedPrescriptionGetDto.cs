using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.UsedPrescription
{
    public class UsedPrescriptionGetDto
    {
        public int Id { get; set; }
        public int? PrescriptionId { get; set; }
        public string? DocumentNumber { get; set; }
        public string AppUserId { get; set; }
        public int MedicineId { get; set; }
        public int TotalAllowedQuantity { get; set; }
        public int UsedQuantity { get; set; }
        public bool IsFullyUsed { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
