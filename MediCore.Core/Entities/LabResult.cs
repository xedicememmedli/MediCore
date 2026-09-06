using MediCore.Core.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class LabResult : BaseEntity
    {
        public string PatientId { get; set; }
        public AppUser Patient { get; set; }

        // Həkim tərəfindən göndərilibsə id-si, pasiyent özü gəlibsə null ola bilər
        public int? DoctorId { get; set; }
        public Doctor Doctor { get; set; }

        public string TestCategory { get; set; } // Məs: "Ümumi Qan Analizi", "Biokimya"
        public DateTime TestDate { get; set; }

        // Status: 0 = Gözləyir (Pending), 1 = Analizdədir (Processing), 2 = Tamamlandı (Completed)
        public int Status { get; set; }

        public string? PdfResultUrl { get; set; } // Əgər skan edilib PDF yüklənəcəksə

        // Sənədin saxtalaşdırılmasının qarşısını almaq üçün unikal kod
        public string VerificationCode { get; set; } = Guid.NewGuid().ToString().Substring(0, 10).ToUpper();

        // Bir analizin içindəki detallar (Hemoglobin, WBC və s.) - İlişki (Relation)
        public List<LabResultDetail> Details { get; set; }
    }
}
