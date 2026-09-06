using MediCore.Core.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.LabResult
{
    public record GetAllLabResultDto
    {
        public int Id { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string PatientName { get; set; }

        public string TestCategory { get; set; }
        public DateTime TestDate { get; set; }
        public LabResultStatus Status { get; set; }
        public int DetailCount { get; set; }
    }
}
