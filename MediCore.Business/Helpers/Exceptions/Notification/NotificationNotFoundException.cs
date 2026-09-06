using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.Notification
{
    public class NotificationNotFoundException : Exception
    {
        public NotificationNotFoundException(string message = "Bildiriş tapılmadı!") : base(message)
        {
        }
    }
}
