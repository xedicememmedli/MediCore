using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.BasketExceptions
{
    public class BasketNotFoundException : Exception
    {
        public BasketNotFoundException(string? message = "İstifadəçiyə aid səbət tapılmadı!") : base(message)
        {
        }
    }
}
