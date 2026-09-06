using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.ChatMessage
{
    public class ChatMessageNotFoundException : Exception
    {
        public ChatMessageNotFoundException(string? message = "Mesaj tapılmadı!") : base(message)
        {
        }
    }
}
