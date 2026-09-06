using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.UsedPrescription
{
    public class UsedPrescriptionNotFoundException : Exception
    {
        public UsedPrescriptionNotFoundException() : base("Resept istifadəsi tapılmadı!")
        {
        }

        public UsedPrescriptionNotFoundException(string message) : base(message)
        {
        }
    }
}
