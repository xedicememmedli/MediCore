using System.Net;
using System.Text.Json;

namespace MediCore.API.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        readonly RequestDelegate _next;

        public GlobalExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";

            string message = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            int statusCode = (int)HttpStatusCode.BadRequest;

            if (ex.GetType().Name.Contains("UserNotFound"))
            {
                statusCode = (int)HttpStatusCode.Unauthorized;
            }
            else if (ex.GetType().Name.Contains("NotFound"))
            {
                statusCode = (int)HttpStatusCode.NotFound;
            }
            else if (ex.GetType().Name.Contains("OutOfStock") || ex.GetType().Name.Contains("Exist"))
            {
                statusCode = (int)HttpStatusCode.Conflict;
            }
            else if (ex.GetType().Name.Contains("Negative") || ex.GetType().Name.Contains("Empty"))
            {
                statusCode = (int)HttpStatusCode.BadRequest;
            }
            else
            {
                // FIX: əvvəlki kod `ex.GetType() == typeof(Exception)` yoxlayırdı.
                // Bu yanlışdır - ArgumentException, InvalidOperationException kimi
                // törəmə xətaları heç tutulmurdu.
                // İndi isə yuxarıdakı heç bir şərtə uymayan BÜTÜN xətalar bura düşür.
                statusCode = (int)HttpStatusCode.InternalServerError;
                message = ex.Message + " | " + ex.InnerException?.Message;
            }

            context.Response.StatusCode = statusCode;

            var response = new
            {
                StatusCode = statusCode,
                ErrorMessage = message
            };

            var json = JsonSerializer.Serialize(response);
            return context.Response.WriteAsync(json);
        }
    }
}

