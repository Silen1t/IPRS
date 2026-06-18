namespace IPRS.Server.DTOs;

public record DepartmentResponseDto(int Id, string Name, DateTime CreatedAt, Guid? ManagerId);

public record CreateDepartmentDto(string Name, Guid? ManagerId);

public record UpdateDepartmentDto(string? Name, Guid? ManagerId, bool RemoveManager = false);