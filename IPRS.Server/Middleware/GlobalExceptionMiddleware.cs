using System.Net;
using System.Text.Json;

namespace IPRS.Server.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IWebHostEnvironment _env;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger,
        IWebHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred during request execution: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        if (context.Response.HasStarted)
        {
            _logger.LogWarning("The response has already started. Skipping global exception payload serialization.");
            return;
        }

        context.Response.ContentType = "application/json";

        context.Response.StatusCode = exception switch
        {
            KeyNotFoundException => (int)HttpStatusCode.NotFound, // 404
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized, // 401

            ArgumentException => (int)HttpStatusCode.BadRequest, // 400

            _ => (int)HttpStatusCode.InternalServerError // 500
        };

        string diagnosticMessage = _env.IsDevelopment()
            ? exception.ToString()
            : "An unexpected internal server error occurred. Please contact the system administrator.";

        var responseEnvelope = new
        {
            success = false,
            message = diagnosticMessage,
            data = (object?)null
        };

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        await context.Response.WriteAsJsonAsync(responseEnvelope, jsonOptions);
    }
}