namespace MediCore.Business.Exceptions;
public class CategoryNullException : Exception
{
    public CategoryNullException() : base("Category not found.") { }
    public CategoryNullException(string message) : base(message) { }
}
