using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.CategoryExceptions
{
    // FIX: Sinif adı CategoryNameExsistException -> CategoryNameExistException
    // "Exsist" yazı səhvi idi. GlobalExceptionMiddleware "Exist" axtarır,
    // "Exsist" tapılmırdı → 409 Conflict əvəzinə 400 BadRequest qaytarırdı.
    // İSTİFADƏ: Bütün servis fayllarında da adı dəyişdirməyi unutma!
    public class CategoryNameExistException : Exception
    {
        public CategoryNameExistException() : base("Belə adda kateqoriya artıq mövcuddur!") { }
        public CategoryNameExistException(string? message) : base(message) { }
    }
}
