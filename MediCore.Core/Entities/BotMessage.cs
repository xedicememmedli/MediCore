using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Core.Entities
{
    public class BotMessage
    {
        public int Id { get; set; }
        public string UserId { get; set; } // İstifadəçini tanımaq üçün
        public string MessageText { get; set; } // Mesajın özü
        public string Role { get; set; } // "user" (müştəri) və ya "model" (bot)
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
