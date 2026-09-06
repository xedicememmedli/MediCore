using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.Consultation
{
    public class ConsultationNotFoundException : Exception
    {
        public ConsultationNotFoundException(string? message = "Konsultasiya tapılmadı!") : base(message)
        {
        }
    }
}
