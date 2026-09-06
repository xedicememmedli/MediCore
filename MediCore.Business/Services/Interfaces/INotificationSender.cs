using MediCore.Business.DTOs.Notification;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Services.Interfaces
{
    public interface INotificationSender
    {
        Task SendToUserAsync(string userId, GetNotificationDto notification);
    }
}
