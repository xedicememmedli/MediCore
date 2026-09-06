using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.Prescription
{
    public class PrescriptionItemNotFoundException : Exception
    {
        public PrescriptionItemNotFoundException(string? message = "Reseptdəki dərman tapılmadı!") : base(message)
        {
        }
    }
}
