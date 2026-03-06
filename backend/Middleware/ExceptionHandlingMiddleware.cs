using Microsoft.AspNetCore.Mvc;

namespace Backend.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
      private readonly RequestDelegate _next = next;
      private readonly ILogger<ExceptionHandlingMiddleware> _logger = logger;

      public async Task InvokeAsync(HttpContext context)
      {
            try
            {
                  await _next(context);
            }
            catch (Exception ex)
            {
                  _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
                  await HandleExceptionAsync(context, ex);
            }
      }

      private static Task HandleExceptionAsync(HttpContext context, Exception exception)
      {
            var statusCode = exception switch
            {
                  ArgumentException => StatusCodes.Status400BadRequest,
                  UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
                  KeyNotFoundException => StatusCodes.Status404NotFound,
                  _ => StatusCodes.Status500InternalServerError
            };

            var title = statusCode switch
            {
                  StatusCodes.Status400BadRequest => "Bad Request",
                  StatusCodes.Status401Unauthorized => "Unauthorized",
                  StatusCodes.Status404NotFound => "Not Found",
                  _ => "Internal Server Error"
            };

            var problemDetails = new ProblemDetails
            {
                  Status = statusCode,
                  Title = title,
                  Detail = exception.Message,
                  Instance = context.Request.Path
            };

            problemDetails.Extensions["traceId"] = context.TraceIdentifier;

            context.Response.ContentType = "application/problem+json";
            context.Response.StatusCode = statusCode;

            return context.Response.WriteAsJsonAsync(problemDetails);
      }
}
