using MediCore.Business.DTOs.Notification;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Context;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace MediCore.API.BackgroundJobs
{
    public class MedicineExpirationJob
    {
        readonly AppDbContext _context;
        readonly INotificationService _notificationService;
        readonly UserManager<AppUser> _userManager;

        public MedicineExpirationJob(AppDbContext context, INotificationService notificationService, UserManager<AppUser> userManager)
        {
            _context = context;
            _notificationService = notificationService;
            _userManager = userManager;
        }

        public async Task CheckExpiredMedicinesAsync()
        {
            var expiredMedicines = await _context.Medicines
                .Where(m => m.ExpireDate <= DateTime.UtcNow && m.StockCount > 0)
                .ToListAsync();

            if (expiredMedicines.Any())
            {
                foreach (var medicine in expiredMedicines)
                {
                    medicine.StockCount = 0;
                }

                await _context.SaveChangesAsync();

                var admin = await _userManager.FindByNameAsync("Superadmin");
                if (admin != null)
                {
                    await _notificationService.CreateAsync(new CreateNotificationDto
                    {
                        AppUserId = admin.Id,
                        Title = "⚠️ Dərmanların Vaxtı Bitdi!",
                        Message = $"Sistem {expiredMedicines.Count} ədəd dərmanın istifadə müddətinin bitdiyini aşkar etdi və stoklarını sıfırladı."
                    });
                }
            }
        }
    }
}
