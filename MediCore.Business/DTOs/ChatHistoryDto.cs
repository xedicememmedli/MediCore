using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs
{
    public class ChatHistoryDto
    {
        public string Role { get; set; } // "user" (Müştəri) və ya "model" (Bot)
        public string Text { get; set; } // Mesajın özü
    }
}
