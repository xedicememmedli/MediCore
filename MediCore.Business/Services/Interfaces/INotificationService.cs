using MediCore.Business.DTOs.Notification;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface INotificationService
    {
        Task<GetNotificationDto> CreateAsync(CreateNotificationDto notificationDto);
        Task UpdateAsync(UpdateNotificationDto notificationDto);
        Task DeleteAsync(int id);
        Task SoftDeleteAsync(int id);
        Task RestoreAsync(int id);

        Task<List<GetAllNotificationDto>> GetAllAsync();
        Task<GetNotificationDto> GetByIdAsync(int id);

        Task<List<GetAllNotificationDto>> GetUserNotificationsAsync(string userId);
        Task MarkAsReadAsync(int id);
    }
}
