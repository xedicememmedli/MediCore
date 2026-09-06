using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.CategoryExceptions
{
    public class CategoryNameExsistException:Exception
    {
        public CategoryNameExsistException():base("Belə adda category var") { }
        public CategoryNameExsistException(string? message):base(message) { }
    }
}
