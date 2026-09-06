using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.Prescription
{
    public class PrescriptionNotFoundException : Exception
    {
        public PrescriptionNotFoundException(string? message = "Resept tapılmadı!") : base(message)
        {
        }
    }
}
