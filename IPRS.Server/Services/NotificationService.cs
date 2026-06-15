using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Extensions;
using IPRS.Server.Models;
using IPRS.Server.Repositories.Interfaces;
using IPRS.Server.Services.Interfaces;

namespace IPRS.Server.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _notificationRepo;
    private readonly IUserRepository _userRepo;

    public NotificationService(INotificationRepository notificationRepo, IUserRepository userRepo)
    {
        _notificationRepo = notificationRepo;
        _userRepo = userRepo;
    }

    public async Task<ServiceResult<ICollection<NotificationResponseDto>>> GetAllNotificationsByUserIdAsync(Guid userId)
    {
        if (!await _userRepo.ExistAsync<User>(userId))
            return ServiceResult<ICollection<NotificationResponseDto>>.LogFailure("User not found");

        var notifications = await _notificationRepo.GetAllByUserIdAsync(userId);
        var notificationResponses = notifications.Select(n => n.ToResponse()).ToArray();
        return ServiceResult<ICollection<NotificationResponseDto>>.LogSuccess(notificationResponses);
    }

    public async Task<ServiceResult<bool?>> UpdateNotificationReadStatus(
        UpdateNotificationReadStatusRequestDto request)
    {
        var notification = await _notificationRepo.UpdateReadStatus(request.Id, request.IsRead);
        if (notification == null)
            return ServiceResult<bool?>.LogFailure("Notification not found.");

        await _notificationRepo.SaveChangesAsync();
        return ServiceResult<bool?>.LogSuccess(notification.IsRead, "Notification read status updated.");
    }

    public async Task<ServiceResult<bool?>> UpdateAllNotificationReadStatus(Guid userId, bool readStatus)
    {
        if (!await _userRepo.ExistAsync<User>(userId))
            return ServiceResult<bool?>.LogFailure("User not found.");
        
        await _notificationRepo.UpdateAllReadStatus(userId, readStatus);

        return ServiceResult<bool?>.LogSuccess(true);
    }
}