namespace MediCore.Business.Exceptions;
public class CategoryNameExsistException : Exception
{
    public CategoryNameExsistException() : base("Category name already exists.") { }
    public CategoryNameExsistException(string message) : base(message) { }
}
