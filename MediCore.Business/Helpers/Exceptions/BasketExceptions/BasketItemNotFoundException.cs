using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.BasketExceptions
{
    public class BasketItemNotFoundException : Exception
    {
        public BasketItemNotFoundException(string? message = "Bu dərman səbətinizdə tapılmadı!") : base(message)
        {
        }
    }
}
