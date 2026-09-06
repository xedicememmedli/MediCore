using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.Doctor
{
    public class DoctorNotFoundException : Exception
    {
        public DoctorNotFoundException(string? message = "Həkim tapılmadı!") : base(message)
        {
        }
    }
}
