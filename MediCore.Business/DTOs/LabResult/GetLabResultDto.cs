using MediCore.Business.DTOs.LabResultDetailDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.LabResult
{
    public record GetLabResultDto
    {
        public int Id { get; set; }
        public string PatientName { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string TestCategory { get; set; }
        public DateTime TestDate { get; set; }
        public int Status { get; set; }
        public string VerificationCode { get; set; } = string.Empty;
        public string? PdfResultUrl { get; set; }
        public List<GetLabResultDetailDto> Details { get; set; }
    }
}
