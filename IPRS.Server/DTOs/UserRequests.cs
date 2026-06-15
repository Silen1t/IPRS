namespace IPRS.Server.DTOs;

public record CreateUserRequest(string FullName, string Email, string Password, string Role, int? DepartmentId);

public record UserResponse(
    Guid Id,
    string EmployeeId,
    string FullName,
    string Email,
    string Role,
    int? DepartmentId,
    bool IsActive,
    DateTime createdAt);

public record UserUpdateRequest(string? FullName, string? Role, int? DepartmentId);

public record UserSummaryResponse(
    Guid Id,
    string EmployeeId,
    string FullName,
    string Email,
    int? DepartmentId
);