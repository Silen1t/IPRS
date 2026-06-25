using IPRS.Server.DTOs;
using IPRS.Server.Hubs;
using IPRS.Server.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace IPRS.Server.Services;

public class SignalRRealTimeService(
    IHubContext<UserHub> userHub,
    IHubContext<DepartmentHub> departmentHub,
    IHubContext<DashboardHub> dashboardHub,
    IHubContext<PurchaseRequestHub> purchaseRequestHub,
    IHubContext<CategoryHub> categoryHub,
    IHubContext<NotificationHub> notificationHub
) : ISignalRRealTimeService
{
    public async Task NotifyUserAsync(string notifyingUserId, NotificationResponseDto notification)
    {
        await notificationHub.Clients.User(notifyingUserId)
            .SendAsync("ReceiveNotification", notification);
    }

    public async Task UpdateCategories()
    {
        await categoryHub.Clients.All.SendAsync("UpdateCategories");
    }

    public async Task UpdateClientPurchaseRequest(PurchaseRequestResponseDto dto, string userIdKey)
    {
        await purchaseRequestHub.Clients.User(userIdKey)
            .SendAsync("ReceiveRequest", dto);
    }

    public async Task UpdateDashboardChangedAsync()
    {
        await dashboardHub.Clients.All.SendAsync("UpdateDashboard");
    }

    public async Task UpdateDepartmentsChangedAsync()
    {
        await departmentHub.Clients.All
            .SendAsync("UpdateDepartments");
    }

    public async Task UpdateGroupPurchaseRequest(PurchaseRequestResponseDto dto, string group)
    {
        await purchaseRequestHub.Clients.Group(group)
            .SendAsync("ReceiveRequest", dto);
    }

    public async Task UpdateUsersChangedAsync()
    {
        await userHub.Clients.All
            .SendAsync("UpdateUsers");
    }
}