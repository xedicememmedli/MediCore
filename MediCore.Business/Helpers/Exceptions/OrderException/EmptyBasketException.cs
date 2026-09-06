using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.OrderException
{
    public class EmptyBasketException : Exception
    {
        public EmptyBasketException(string? message = "Səbətiniz boşdur. Sifariş verməzdən əvvəl səbətinizə dərman əlave edin.") : base(message)
        {
        }
    }
}
