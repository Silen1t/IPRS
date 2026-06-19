namespace IPRS.Server.DTOs;

public record NotificationResponseDto(
    Guid Id,
    string Message,
    bool IsRead,
    DateTime CreatedAt,
    Guid? RelatedRequestId
);

public record UpdateNotificationReadStatusDto(
    bool IsRead
);

public record CreateNotificationDto(Guid UserId, string Message, Guid RelatedRequestId);