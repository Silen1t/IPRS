using IPRS.Server.Common;
using IPRS.Server.DTOs;

namespace IPRS.Server.Services.Interfaces;

public interface IDepartmentService
{
    Task<ServiceResult<ICollection<DepartmentResponseDto>>> GetAllDepartmentsAsync();
    Task<ServiceResult<DepartmentResponseDto>> GetDepartmentByIdAsync(int id);
    Task<ServiceResult<DepartmentResponseDto>> CreateDepartmentAsync(CreateDepartmentDto  request);
    Task<ServiceResult<DepartmentResponseDto>> UpdateDepartmentByIdAsync(int id, UpdateDepartmentDto request);
}