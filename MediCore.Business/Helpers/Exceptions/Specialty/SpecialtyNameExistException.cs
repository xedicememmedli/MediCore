using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.Specialty
{
    public class SpecialtyNameExistException : Exception
    {
        public SpecialtyNameExistException(string? message = "Bu adda ixtisas artıq mövcuddur!") : base(message)
        {
        }
    }
}
