using MediCore.Business.DTOs.Notification;
using MediCore.Business.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace MediCore.API.Hubs
{
    public class NotificationSender : INotificationSender
    {
        readonly IHubContext<NotificationHub> _hubContext;

        public NotificationSender(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendToUserAsync(string userId, GetNotificationDto notification)
        {
            await _hubContext.Clients.User(userId).SendAsync("ReceiveNotification", notification);
        }
    }
}
