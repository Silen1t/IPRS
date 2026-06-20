using Microsoft.AspNetCore.SignalR;

namespace IPRS.Server.Providers;

public class UserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        return connection.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    }
}