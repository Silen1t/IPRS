using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Extensions;

public static class NotificationMappingExtensions
{
    public static NotificationResponseDto ToResponse(this Notification notification)
    {
        return new NotificationResponseDto(notification.Id, notification.Message,
            notification.IsRead, notification.CreatedAt, notification.RelatedRequestId);
    }

    public static Notification ToEntity(this CreateNotificationDto request)
    {
        return new Notification()
        {
            Message = request.Message,
            RelatedRequestId = request.RelatedRequestId,
            UserId = request.UserId,
        };
    }
}