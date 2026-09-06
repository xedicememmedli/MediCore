using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace MediCore.API.Hubs
{
    public class ChatHub : Hub
    {
        // Online istifadəçiləri saxlayır
        private static readonly HashSet<string> _onlineUsers = new();
        // Hər istifadəçinin son görülmə vaxtını saxlayır
        private static readonly Dictionary<string, DateTime> _lastSeen = new();

        // 1. Mesaj göndər - həm alıcı həm göndərən görür
        public async Task SendMessageToUser(string receiverId, string message)
        {
            var senderId = Context.UserIdentifier;
            // Alıcıya göndər
            await Clients.User(receiverId).SendAsync("ReceiveMessage", senderId, message);
            // Göndərən özü də görsün
            await Clients.User(senderId!).SendAsync("ReceiveMessage", senderId, message);
        }

        // 2. Mavi tik - mesaj oxunanda göndərənə bildirilir
        public async Task MarkMessageAsRead(string messageId, string senderId)
        {
            await Clients.User(senderId).SendAsync("MessageSeen", messageId);
        }

        // 3. Status yoxla - frontend chati açanda çağırır
        // isOnline = true  → "Online" göstər
        // isOnline = false → "Son görülmə: 14:32" göstər
        public async Task GetStatus(string targetUserId)
        {
            var isOnline = _onlineUsers.Contains(targetUserId);
            var lastSeen = _lastSeen.TryGetValue(targetUserId, out var t) ? t : (DateTime?)null;
            await Clients.Caller.SendAsync("StatusResult", isOnline, lastSeen);
        }

        // 4. Qoşuldu - online siyahısına əlavə et
        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (userId != null)
                _onlineUsers.Add(userId);
            await base.OnConnectedAsync();
        }

        // 5. Ayrıldı - online siyahısından çıxar, son görülmə vaxtını saxla
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            if (userId != null)
            {
                _onlineUsers.Remove(userId);
                _lastSeen[userId] = DateTime.UtcNow;
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}