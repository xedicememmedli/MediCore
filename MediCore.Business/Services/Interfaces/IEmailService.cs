using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendPrescriptionPdfAsync(string toEmail, string patientName, byte[] pdfBytes);
        Task SendWelcomeEmailAsync(string toEmail, string fullName, string role);
        Task SendAppointmentToPatientAsync(string toEmail, string patientName, string doctorName, DateTime date, string paymentUrl);
        Task SendAppointmentToDoctorAsync(string toEmail, string doctorName, string patientName, DateTime date);
        Task SendLabResultReadyEmailAsync(string toEmail, string patientName);
        Task SendPasswordResetEmailAsync(string toEmail, string userName, string token);
        Task SendEmailAsync(string toEmail, string subject, string body);
    }
}
