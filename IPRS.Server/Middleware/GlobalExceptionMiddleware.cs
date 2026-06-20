using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;

// Assuming a custom domain exception namespace exists, e.g.:
using IPRS.Server.Exceptions; 

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

            DomainValidationException => (int)HttpStatusCode.BadRequest, // 400

            _ => (int)HttpStatusCode.InternalServerError // 500
        };

        // Provide full error details only in development mode to guard sensitive data
        string diagnosticMessage = _env.IsDevelopment()
            ? exception.ToString()
            : "An unexpected internal server error occurred. Please contact the system administrator.";

        // Keep your API payload contract identical to your standard ServiceResult wrapper
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

        // 🌟 Optimization: Stream JSON directly to the response body instead of allocating a string buffer
        await context.Response.WriteAsJsonAsync(responseEnvelope, jsonOptions);
    }
}