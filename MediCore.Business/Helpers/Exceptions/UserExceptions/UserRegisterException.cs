using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.UserExceptions
{
    public class UserRegisterException : Exception
    {
        public UserRegisterException():base("Register zamanı xəta meydana gəldi")
        { }
        
        public UserRegisterException(string? message):base(message) { }
    }
}
