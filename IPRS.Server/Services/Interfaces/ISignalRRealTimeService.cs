using IPRS.Server.DTOs;

namespace IPRS.Server.Services.Interfaces;

public interface ISignalRRealTimeService
{
    Task UpdateUsersChangedAsync();
    Task UpdateDepartmentsChangedAsync();
    Task UpdateCategories();
    Task UpdateDashboardChangedAsync();
    Task UpdateClientPurchaseRequest(PurchaseRequestResponseDto dto, string userIdKey);
    Task UpdateGroupPurchaseRequest(PurchaseRequestResponseDto dto, string userIdKey);
    Task NotifyUserAsync(string notifyingUserId, NotificationResponseDto notification);
}