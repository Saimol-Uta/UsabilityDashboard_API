using System.Net;
using System.Text.Json;

namespace UsabilityDashboard_API.Middlewares
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource not found");
                await WriteErrorAsync(context, HttpStatusCode.NotFound, ex.Message);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument");
                await WriteErrorAsync(context, HttpStatusCode.BadRequest, ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error");
                await WriteErrorAsync(context, HttpStatusCode.InternalServerError,
                    "An unexpected error occurred");
            }
        }

        private static async Task WriteErrorAsync(
            HttpContext context, HttpStatusCode statusCode, string message)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var response = new { statusCode = (int)statusCode, message };
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
