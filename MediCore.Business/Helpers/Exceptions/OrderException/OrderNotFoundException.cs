using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.OrderException
{
    public class OrderNotFoundException : Exception
    {
        public OrderNotFoundException(string? message = "Sifariş tapılmadı!") : base(message)
        {
        }
    }
}
