using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.Common
{
    public class NegativeIdException : Exception
    {
        public NegativeIdException():base("Id 0 və ya mənfi ola bilməz") { }
        public NegativeIdException(string? message):base(message) 
        { 

        }
    }
}
