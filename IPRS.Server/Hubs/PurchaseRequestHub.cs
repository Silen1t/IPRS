
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace IPRS.Server.Hubs;

[Authorize]
public class PurchaseRequestHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        if (Context.User?.IsInRole("Finance") == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Finance");
        }

        await base.OnConnectedAsync();
    }
}