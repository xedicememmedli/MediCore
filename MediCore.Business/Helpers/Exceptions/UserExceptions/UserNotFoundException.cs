using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.UserExceptions
{
    public class UserNotFoundException : Exception
    {
        public UserNotFoundException(string message = "İstifadəçi tapılmadı və ya sistemə daxil olmayıb!") : base(message)
        {
        }
    }
}
