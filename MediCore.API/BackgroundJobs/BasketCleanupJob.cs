using MediCore.Business.DTOs.Notification;
using MediCore.Business.Services.Interfaces;
using MediCore.Core.Entities;
using MediCore.DAL.Context;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace MediCore.API.BackgroundJobs
{
    public class BasketCleanupJob
    {
        readonly AppDbContext _context;
        readonly INotificationService _notificationService;
        readonly UserManager<AppUser> _userManager;

        public BasketCleanupJob(AppDbContext context, INotificationService notificationService, UserManager<AppUser> userManager)
        {
            _context = context;
            _notificationService = notificationService;
            _userManager = userManager;
        }

        public async Task CleanExpiredBasketsAsync()
        {
            // HEÇ BİR JSON LAZIM DEYİL, BİRBAŞA KODDA 3 GÜN (-3 DAYS) QOYURUQ
            var expiredBaskets = await _context.Baskets
                .Where(b => b.UpdatedAt <= DateTime.UtcNow.AddDays(-3) && b.IsDeleted == false)
                .ToListAsync();

            if (expiredBaskets.Any())
            {
                // Səbətlər arxivə atılır
                foreach (var basket in expiredBaskets)
                {
                    basket.IsDeleted = true;
                    basket.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                var admin = await _userManager.FindByNameAsync("Superadmin");
                if (admin != null)
                {
                    await _notificationService.CreateAsync(new CreateNotificationDto
                    {
                        AppUserId = admin.Id,
                        Title = "🧹 Səbətlər Təmizləndi",
                        Message = $"Robot {expiredBaskets.Count} ədəd (3 gündür toxunulmayan) səbəti arxivə atdı."
                    });
                }
            }
        }
    }
}