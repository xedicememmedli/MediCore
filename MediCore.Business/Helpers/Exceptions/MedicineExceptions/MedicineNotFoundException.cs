using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.MedicineExceptions
{
    public class MedicineNotFoundException : Exception
    {
        public MedicineNotFoundException(string? message = "Axtarılan dərman tapılmadı!") : base(message)
        {
        }
    }
}