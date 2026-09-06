using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.Courier
{
    public class CourierNotFoundException : Exception
    {
        public CourierNotFoundException(string? message = "Kuryer tapılmadı!") : base(message)
        {
        }
    }
}
