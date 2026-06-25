namespace IPRS.Server.Common;

public class ServiceResult<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public T? Data { get; set; }

    public static ServiceResult<T> LogSuccess(T data) =>
        new() { Success = true, Data = data };

    public static ServiceResult<T> LogSuccess(T data, string message) =>
        new() { Success = true, Data = data, Message = message };

    public static ServiceResult<T> LogFailure(string message) =>
        new() { Success = false, Message = message };

    public static ServiceResult<T> LogFailure(string message, int statusCode) =>
        new() { Success = false, Message = message, StatusCode = statusCode };
}