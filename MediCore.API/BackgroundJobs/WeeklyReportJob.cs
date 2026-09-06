using MediCore.Business.DTOs.Notification;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Context;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace MediCore.API.BackgroundJobs
{
    public class WeeklyReportJob
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;
        private readonly UserManager<AppUser> _userManager;

        public WeeklyReportJob(AppDbContext context, IEmailService emailService, INotificationService notificationService, UserManager<AppUser> userManager)
        {
            _context = context;
            _emailService = emailService;
            _notificationService = notificationService;
            _userManager = userManager;
        }

        public async Task GenerateAndSendWeeklyReportAsync()
        {
            var endDate = DateTime.UtcNow.Date;
            var startDate = endDate.AddDays(-7);

            // 1. KLİNİKA (QƏBULLAR) STATİSTİKASI
            var weeklyConsultations = await _context.Consultations
                .Include(c => c.Doctor)
                    .ThenInclude(d => d.AppUser)
                .Include(c => c.Patient)
                .Where(c => c.ScheduledTime.Date >= startDate && c.ScheduledTime.Date < endDate && c.IsActive == true)
                .ToListAsync();

            int totalConsultations = weeklyConsultations.Count;
            int insuredPatientsCount = weeklyConsultations.Count(c => c.Patient.HasInsurance == true);
            int payingPatientsCount = weeklyConsultations.Count(c => c.Patient.HasInsurance == false);

            // Klinika Gəliri = Nağd ödəyən HƏR BİR xəstənin müraciət etdiyi həkimin ÖZ qəbul qiymətlərinin cəmi
            decimal clinicRevenue = weeklyConsultations
                .Where(c => c.Patient.HasInsurance == false)
                .Sum(c => c.Doctor.ConsultationFee);

            // Həkimlərin performansı və fərdi gəlirləri
            var doctorStats = weeklyConsultations
                .GroupBy(c => c.Doctor)
                .Select(g => new
                {
                    DoctorName = g.Key.AppUser.Name,
                    TotalPatients = g.Count(),
                    // Həkimin gətirdiyi qazanc = Bu həkimin nağd ödəyən xəstə SAYI * Həkimin ÖZ QİYMƏTİ (ConsultationFee)
                    EarnedRevenue = g.Count(c => c.Patient.HasInsurance == false) * g.Key.ConsultationFee
                })
                .OrderByDescending(x => x.EarnedRevenue)
                .ToList();


            // 2. APTEK STATİSTİKASI (Dərman satışları)
            var weeklyOrders = await _context.Orders
              .Where(o => o.CreatedAt >= startDate && o.CreatedAt < endDate)
              .ToListAsync();

            int totalOrders = weeklyOrders.Count;
            decimal pharmacyRevenue = weeklyOrders.Sum(o => o.TotalPrice);

            // ÜMUMİ DÖVRİYYƏ (Klinika + Aptek)
            decimal totalGrandRevenue = clinicRevenue + pharmacyRevenue;

            // 3. Əsas Admini (Superadmin) tapmaq üçün hazırlıq
            var admin = await _userManager.FindByNameAsync("Superadmin");
            if (admin == null) return; // Əgər admin yoxdursa, əməliyyatı dayandır

            // 4. MÖHTƏŞƏM E-MAIL CƏDVƏLİ
            string reportMsg = $@"
                <p>Salam Hörmətli <strong>Admin</strong>,</p>
                <p>MediCore sisteminin <strong>{startDate:dd.MM.yyyy} - {endDate:dd.MM.yyyy}</strong> tarixləri üzrə maliyyə hesabatı:</p>
                
                <div style='background-color: #e6f0fa; border-left: 4px solid #003366; padding: 15px; margin: 20px 0;'>
                    <h3 style='margin: 0 0 15px 0; color: #003366;'>💰 Həftəlik Ümumi Göstəricilər</h3>
                    <p style='margin: 0 0 8px 0;'><strong>🏥 Klinika Qəbul Sayı:</strong> {totalConsultations} (Bunun {insuredPatientsCount} nəfəri sığortalıdır)</p>
                    <p style='margin: 0 0 8px 0;'><strong>💊 Aptek Sifariş Sayı:</strong> {totalOrders} sifariş</p>
                    <hr style='border: 1px solid #cce0f5; margin: 10px 0;'>
                    <p style='margin: 0 0 5px 0;'>Klinika Nağd Gəliri: {clinicRevenue:0.00} AZN</p>
                    <p style='margin: 0 0 10px 0;'>Aptek Satış Gəliri: {pharmacyRevenue:0.00} AZN</p>
                    <p style='margin: 0; font-size: 18px; color: #28a745;'><strong>💳 ÜMUMİ QAZANC: {totalGrandRevenue:0.00} AZN</strong></p>
                </div>

                <h3 style='color: #003366; margin-top: 30px;'>👨‍⚕️ Həkimlər üzrə statistika:</h3>
                <table style='width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 15px;'>
                    <thead>
                        <tr style='background-color: #003366; color: #ffffff; text-align: left;'>
                            <th style='padding: 12px; border: 1px solid #ddd;'>Həkimin Adı</th>
                            <th style='padding: 12px; border: 1px solid #ddd; text-align: center;'>Qəbul Sayı</th>
                            <th style='padding: 12px; border: 1px solid #ddd; text-align: right;'>Gətirdiyi Gəlir</th>
                        </tr>
                    </thead>
                    <tbody>";

            foreach (var stat in doctorStats)
            {
                reportMsg += $@"
                    <tr>
                        <td style='padding: 12px; border: 1px solid #ddd;'>Dr. {stat.DoctorName}</td>
                        <td style='padding: 12px; border: 1px solid #ddd; text-align: center;'><strong>{stat.TotalPatients}</strong></td>
                        <td style='padding: 12px; border: 1px solid #ddd; text-align: right; color: #28a745;'><strong>{stat.EarnedRevenue:0.00} AZN</strong></td>
                    </tr>";
            }

            reportMsg += @"
                    </tbody>
                </table>
                <p style='margin-top: 20px; font-size: 13px; color: #555;'>* Sığortalı xəstələrin qəbulu gəlir cədvəlində 0.00 AZN kimi hesablanmışdır.</p>";

            // 5. Məktub və Bildiriş Göndərilməsi (Birbaşa adminə)
            await _emailService.SendEmailAsync(admin.Email, "Həftəlik Ümumi Maliyyə Hesabatı 📊", reportMsg);

            await _notificationService.CreateAsync(new CreateNotificationDto
            {
                AppUserId = admin.Id,
                Title = "Maliyyə Hesabatı 📊",
                Message = $"Həftəlik gəlir: {totalGrandRevenue:0.00} AZN (Klinika: {clinicRevenue} AZN, Aptek: {pharmacyRevenue} AZN). Detallar e-maildə."
            });
        }
    }
}