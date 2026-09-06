using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs
{
    public class AiPrescriptionResultDto
    {
        public bool IsValidPrescription { get; set; } // Reseptdirmi? (true/false)
        public string? DocumentNumber { get; set; }
        public string? MedicineName { get; set; } // Dərmanın adı
        public int AllowedQuantity { get; set; } // Həkimin icazə verdiyi say (məs: 3)
        public string? PatientName { get; set; } // Xəstənin adı
        public string? Date { get; set; } // Reseptin tarixi
        public string? ErrorMessage { get; set; } // Əgər pişik şəkli yükləyibsə, AI bura səbəb yazacaq
    }
}
