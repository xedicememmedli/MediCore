using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MediCore.Business.Helpers.Exceptions.CategoryExceptions
{
    // FIX: Sinif adı CategoryNullException -> CategoryNotFoundException olaraq dəyişdirildi.
    // Əvvəlki ad GlobalExceptionMiddleware-in "NotFound" yoxlamasına uyğun gəlmirdi,
    // ona görə 404 əvəzinə 400 BadRequest qaytarırdı.
    // İSTİFADƏ: Bütün servis fayllarında da adı dəyişdirməyi unutma!
    public class CategoryNotFoundException : Exception
    {
        public CategoryNotFoundException() : base("Kateqoriya tapılmadı!") { }
        public CategoryNotFoundException(string? message) : base(message) { }
    }
}
