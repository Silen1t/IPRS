using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Extensions;
using IPRS.Server.Models;
using IPRS.Server.Repositories.Interfaces;
using IPRS.Server.Services.Interfaces;

namespace IPRS.Server.Services;

public class NotificationService(INotificationRepository notificationRepo, IUserRepository userRepo)
    : INotificationService
{
    public async Task<ServiceResult<ICollection<NotificationResponseDto>>> GetAllNotificationsByUserIdAsync(Guid userId)
    {
        if (!await userRepo.ExistAsync<User>(userId))
            return ServiceResult<ICollection<NotificationResponseDto>>.LogFailure("User not found");

        var notifications = await notificationRepo.GetAllByUserIdAsync(userId);
        var notificationResponses = notifications.Select(n => n.ToResponse()).ToArray();
        return ServiceResult<ICollection<NotificationResponseDto>>.LogSuccess(notificationResponses);
    }

    public async Task<ServiceResult<bool?>> UpdateNotificationReadStatus(
        Guid id,
        Guid currentUserId,
        UpdateNotificationReadStatusDto request
    )
    {
        var notification = await notificationRepo.GetByIdAsync(id);
        if (notification == null || notification.UserId != currentUserId)
            return ServiceResult<bool?>.LogFailure("Notification not found.");


        notification.IsRead = request.IsRead;
        await notificationRepo.SaveChangesAsync();
        return ServiceResult<bool?>.LogSuccess(notification.IsRead, "Notification read status updated.");
    }

    public async Task<ServiceResult<bool?>> UpdateAllNotificationReadStatus(Guid userId, bool readStatus)
    {
        if (!await userRepo.ExistAsync<User>(userId))
            return ServiceResult<bool?>.LogFailure("User not found.");

        await notificationRepo.UpdateAllReadStatus(userId, readStatus);

        return ServiceResult<bool?>.LogSuccess(true);
    }

    public async Task<ServiceResult<NotificationResponseDto>> CreateNotificationAsync(CreateNotificationDto request)
    {
        if (!await userRepo.ExistAsync<User>(request.UserId))
            return ServiceResult<NotificationResponseDto>.LogFailure(
                $"Notification recipient user with ID {request.UserId} was not found.");

        var notification = request.ToEntity();

        await notificationRepo.CreateAsync(notification);
        await notificationRepo.SaveChangesAsync();

        return ServiceResult<NotificationResponseDto>.LogSuccess(notification.ToResponse());
    }
}