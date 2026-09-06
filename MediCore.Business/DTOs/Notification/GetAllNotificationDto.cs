using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.Notification
{
    public record GetAllNotificationDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; }
        public int? OrderId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
