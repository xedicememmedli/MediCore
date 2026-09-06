using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.DTOs.ChatMessage
{
    public record GetChatMessageDto
    {
        public int Id { get; set; }
        public int ConsultationId { get; set; }
        public string SenderId { get; set; }

        // MessageText yerinə Message yazırıq
        public string Message { get; set; }

        // SentAt yerinə BaseEntity-də nə yazmısansa onu yaz (məsələn CreatedDate)
        public DateTime CreatedDate { get; set; }
    }
}
