using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs
{
    public class ChatRequestDto
    {
        public string Message { get; set; }
        public string Language { get; set; } = "az"; // Susmaya görə "az" (Azərbaycan) olsun
        public List<ChatHistoryDto>? History { get; set; }
    }
}
