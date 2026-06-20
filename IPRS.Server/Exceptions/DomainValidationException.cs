using System;

namespace IPRS.Server.Exceptions;

/// <summary>
/// Exception thrown when a domain business rule or validation constraint is violated.
/// Maps to a 400 Bad Request in the GlobalExceptionMiddleware.
/// </summary>
public class DomainValidationException : Exception
{
    public DomainValidationException() : base() { }

    public DomainValidationException(string message) : base(message) { }

    public DomainValidationException(string message, Exception innerException) : base(message, innerException) { }
}