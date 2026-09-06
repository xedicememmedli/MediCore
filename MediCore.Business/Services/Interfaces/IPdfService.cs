using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface IPdfService
    {
        Task<byte[]> GeneratePrescriptionPdfAsync(int prescriptionId);
        Task SendPdfToEmailBackgroundAsync(int prescriptionId, string patientEmail, string patientName);
    }
}
