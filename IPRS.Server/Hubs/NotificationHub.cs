
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace IPRS.Server.Hubs;
[Authorize]
public class NotificationHub : Hub;