using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.BasketExceptions
{
    public class OutOfStockException : Exception
    {
        public OutOfStockException(string? message = "Seçdiyiniz dərman üçün kifayət qədər stok yoxdur!") : base(message)

        {
        }
    }
}
