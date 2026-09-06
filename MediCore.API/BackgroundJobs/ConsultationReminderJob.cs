using MediCore.Business.DTOs.Notification;
using MediCore.Business.Services.Interfaces;
using MediCore.DAL.Context;
using Microsoft.EntityFrameworkCore;

namespace MediCore.API.BackgroundJobs
{
    public class ConsultationReminderJob
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;

        public ConsultationReminderJob(AppDbContext context, IEmailService emailService, INotificationService notificationService)
        {
            _context = context;
            _emailService = emailService;
            _notificationService = notificationService;
        }

        public async Task SendTodayRemindersAsync()
        {
            // DÜZƏLIŞ: DateTime.UtcNow.Date istifadə edilir — server UTC ilə işləyir
            var today = DateTime.UtcNow.Date;

            var consultations = await _context.Consultations
                .Include(c => c.Patient)
                .Include(c => c.Doctor)
                    .ThenInclude(d => d.AppUser)
                .Where(c => c.ScheduledTime.Date == today && c.IsActive == true)
                .ToListAsync();

            if (!consultations.Any()) return;

            // Pasiyentlərə E-mail və Bildiriş
            foreach (var consultation in consultations)
            {
                string patientMsg = $@"
                    <p>Salam Hörmətli <strong>{consultation.Patient.Name}</strong>,</p>
                    <p>Sizə xatırladırıq ki, <strong>bugün</strong> üçün həkim qəbulunuz təyin olunub.</p>
                    <div style='background-color: #e6f0fa; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;'>
                        <p style='margin: 0 0 10px 0;'><strong>Həkim:</strong> Dr. {consultation.Doctor.AppUser.Name}</p>
                        <p style='margin: 0;'><strong>Tarix və Saat:</strong> {consultation.ScheduledTime:dd.MM.yyyy HH:mm}</p>
                    </div>
                    <p>Xahiş edirik, təyin olunmuş vaxtdan 15 dəqiqə əvvəl klinikada olasınız.</p>";

                await _emailService.SendEmailAsync(consultation.Patient.Email, "Bugünkü Görüşünüz ⏰", patientMsg);

                await _notificationService.CreateAsync(new CreateNotificationDto
                {
                    AppUserId = consultation.PatientId,
                    Title = "Görüş Xatırlatması ⏰",
                    Message = $"Bugün saat {consultation.ScheduledTime:HH:mm} üçün Dr. {consultation.Doctor.AppUser.Name} ilə görüşünüz var."
                });
            }

            // Həkimlərə CƏDVELLİ E-mail və Bildiriş
            var groupedByDoctor = consultations.GroupBy(c => c.Doctor);

            foreach (var group in groupedByDoctor)
            {
                var doctor = group.Key;
                var doctorConsultations = group.OrderBy(c => c.ScheduledTime).ToList();

                string doctorMsg = $@"
                    <p>Salam Hörmətli <strong>Dr. {doctor.AppUser.Name}</strong>,</p>
                    <p>Bugünkü qəbul cədvəlinizi sizə təqdim edirik:</p>
                    <table style='width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 15px;'>
                        <thead>
                            <tr style='background-color: #003366; color: #ffffff; text-align: left;'>
                                <th style='padding: 12px; border: 1px solid #ddd;'>Saat</th>
                                <th style='padding: 12px; border: 1px solid #ddd;'>Pasiyent Adı</th>
                            </tr>
                        </thead>
                        <tbody>";

                foreach (var c in doctorConsultations)
                {
                    doctorMsg += $@"
                            <tr>
                                <td style='padding: 12px; border: 1px solid #ddd;'><strong>{c.ScheduledTime:HH:mm}</strong></td>
                                <td style='padding: 12px; border: 1px solid #ddd;'>{c.Patient.Name}</td>
                            </tr>";
                }

                doctorMsg += @"
                        </tbody>
                    </table>
                    <p>Sizə uğurlu və məhsuldar iş günü arzulayırıq!</p>";

                await _emailService.SendEmailAsync(doctor.AppUser.Email, "Bugünkü Qəbul Cədvəliniz 📅", doctorMsg);

                await _notificationService.CreateAsync(new CreateNotificationDto
                {
                    AppUserId = doctor.AppUserId,
                    Title = "Bugünkü Cədvəl 📅",
                    Message = $"Bugün üçün {doctorConsultations.Count} pasiyent qəbulunuz var. Cədvələ baxmağı unutmayın."
                });
            }
        }
    }
}
