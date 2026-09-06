using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.UserExceptions
{
    public class UserLoginFailedException : Exception
    {
        public UserLoginFailedException():base("UserName və ya Password səhvdir"){}
       

        public UserLoginFailedException(string? message) : base(message)
        {
        }
    }
}
