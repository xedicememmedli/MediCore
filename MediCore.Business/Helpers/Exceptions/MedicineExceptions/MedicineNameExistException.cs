using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.MedicineExceptions
{
    public class MedicineNameExistException : Exception
    {
        public MedicineNameExistException() : base("Bu adda dərman artıq mövcuddur") { }
        public MedicineNameExistException(string? message) : base(message) { }
    }
}
