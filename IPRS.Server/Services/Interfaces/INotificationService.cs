using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Services.Interfaces;

public interface INotificationService
{
    Task<ServiceResult<ICollection<NotificationResponseDto>>> GetAllNotificationsByUserIdAsync(Guid userId);

    Task<ServiceResult<bool?>> UpdateNotificationReadStatus(
        Guid id,
        UpdateNotificationReadStatusDto request
    );

    Task<ServiceResult<bool?>> UpdateAllNotificationReadStatus(Guid userId, bool readStatus);
    Task<ServiceResult<Guid>> CreateNotificationAsync(CreateNotificationDto request);
}