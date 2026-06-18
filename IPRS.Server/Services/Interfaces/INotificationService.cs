using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Services.Interfaces;

public interface INotificationService
{
    Task<ServiceResult<ICollection<NotificationResponseDto>>> GetAllNotificationsByUserIdAsync(Guid userId);
    Task<ServiceResult<NotificationResponseDto>> GetNotificationIdAsync(Guid notificationId);

    Task<ServiceResult<bool?>> UpdateNotificationReadStatus(
        Guid id,
        UpdateNotificationReadStatusDto request
    );

    Task<ServiceResult<bool?>> UpdateAllNotificationReadStatus(Guid userId, bool readStatus);
    Task<ServiceResult<NotificationResponseDto>> CreateNotificationAsync(CreateNotificationDto request);
}