using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.ChatMessage
{
    public record GetAllChatMessageDto
    {
        public int Id { get; set; }
        public int ConsultationId { get; set; }
        public string SenderId { get; set; }
        public string Message { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
