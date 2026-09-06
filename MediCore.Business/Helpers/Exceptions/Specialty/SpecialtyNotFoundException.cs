using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.Specialty
{
    public class SpecialtyNotFoundException : Exception
    {
        public SpecialtyNotFoundException(string? message = "İxtisas tapılmadı!") : base(message)
        {
        }
    }
}
