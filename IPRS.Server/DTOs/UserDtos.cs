namespace IPRS.Server.DTOs;

public record CreateUserDto(
    string FullName,
    string Email,
    string Password,
    string Role,
    int? DepartmentId
);

public record UserResponseDto(
    Guid Id,
    string EmployeeId,
    string FullName,
    string Email,
    string Role,
    int? DepartmentId,
    bool IsActive,
    DateTime CreatedAt
);

public record UpdateUserDto(
    string? FullName,
    string? Role,
    int? DepartmentId,
    bool RemoveDepartment = false
);

public record UserSummaryResponse(
    Guid Id,
    string EmployeeId,
    string FullName,
    string Email,
    int? DepartmentId
);