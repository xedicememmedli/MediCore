using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.LabResultDetail
{
    public class LabResultDetailNotFoundException : Exception
    {
        public LabResultDetailNotFoundException(string? message = "Laboratoriya analizi detalı tapılmadı!") : base(message)
        {
        }
    }
}
