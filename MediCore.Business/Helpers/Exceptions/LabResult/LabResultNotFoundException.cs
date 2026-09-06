using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.LabResult
{
    public class LabResultNotFoundException : Exception
    {
        public LabResultNotFoundException(string? message = "Laboratoriya nəticəsi tapılmadı!") : base(message)
        {
        }
    }
}
