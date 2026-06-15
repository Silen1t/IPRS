namespace IPRS.Server.Common;

public class ServiceResult<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }

    public static ServiceResult<T> LogSuccess(T data) => 
        new() { Success = true, Data = data };

    public static ServiceResult<T> LogFailure(string message) => 
        new() { Success = false, Message = message };
}