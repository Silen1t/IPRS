using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Extensions;

public static class DepartmentMappingExtensions
{
    public static DepartmentResponseDto ToResponse(this Department department)
    {
        return new DepartmentResponseDto(department.Id, department.Name, department.CreatedAt, department.ManagerId);
    }

    public static Department ToEntity(this DepartmentResponseDto department)
    {
        return new()
        {
            Id =  department.Id,
            Name = department.Name,
            CreatedAt = department.CreatedAt,
            ManagerId = department.ManagerId,
        };
    }
    
    public static Department ToEntity(this CreateDepartmentDto department)
    {
        return new()
        {
            Name = department.Name,
            ManagerId = department.ManagerId,
        };
    }
}