namespace IPRS.Server.DTOs;

public record NotificationResponseDto(
    Guid Id,
    string Message,
    bool IsRead,
    DateTime CreatedAt
);

public record UpdateNotificationReadStatusRequestDto(
    Guid Id,
    bool IsRead
);