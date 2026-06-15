using IPRS.Server.Common;
using IPRS.Server.DTOs;

namespace IPRS.Server.Services.Interfaces;

public interface INotificationService
{
    Task<ServiceResult<ICollection<NotificationResponseDto>>> GetAllNotificationsByUserIdAsync(Guid userId);

    Task<ServiceResult<bool?>> UpdateNotificationReadStatus(
        UpdateNotificationReadStatusRequestDto request);
    
    Task<ServiceResult<bool?>> UpdateAllNotificationReadStatus(Guid userId, bool readStatus);
}