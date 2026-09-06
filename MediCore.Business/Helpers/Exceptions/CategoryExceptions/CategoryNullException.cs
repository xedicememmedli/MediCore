using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.CategoryExceptions
{
    public class CategoryNullException : Exception
    {
        public CategoryNullException() : base("Category tapılmadı!") { }
        public CategoryNullException(string? message) : base(message) 
        {

        }
    }
}
