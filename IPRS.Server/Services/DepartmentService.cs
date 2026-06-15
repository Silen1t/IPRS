using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Extensions;
using IPRS.Server.Models;
using IPRS.Server.Repositories.Interfaces;
using IPRS.Server.Services.Interfaces;

namespace IPRS.Server.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _departmentRepo;

    public DepartmentService(IDepartmentRepository departmentRepo)
    {
        _departmentRepo = departmentRepo;
    }

    public async Task<ServiceResult<ICollection<DepartmentResponseDto>>> GetAllDepartmentsAsync()
    {
        var departments = await _departmentRepo.GetAll();
        var departmentsResponse = departments.Select(d => d.ToResponse()).ToArray();
        return ServiceResult<ICollection<DepartmentResponseDto>>.LogSuccess(departmentsResponse);
    }

    public async Task<ServiceResult<DepartmentResponseDto>> GetDepartmentByIdAsync(int id)
    {
        var department = await _departmentRepo.GetByIdAsync(id);
        if (department == null)
        {
            return ServiceResult<DepartmentResponseDto>.LogFailure("Department not found.");
        }

        return ServiceResult<DepartmentResponseDto>.LogSuccess(department.ToResponse());
    }

    public async Task<ServiceResult<DepartmentResponseDto>> CreateDepartmentAsync(CreateDepartmentDto request)
    {
        var newDepartment = request.ToEntity();
        await _departmentRepo.AddAsync(newDepartment);
        await _departmentRepo.SaveChangesAsync();

        return ServiceResult<DepartmentResponseDto>.LogSuccess(newDepartment.ToResponse());
    }

    public async Task<ServiceResult<DepartmentResponseDto>> UpdateDepartmentByIdAsync(int id, UpdateDepartmentDto request)
    {
        Department? department = await _departmentRepo.GetByIdAsync(id);
        if (department == null)
            return ServiceResult<DepartmentResponseDto>.LogFailure("Department not found.");
        
        if(request.Name != null) department.Name = request.Name;
        if(request.ManagerId != null) department.ManagerId = request.ManagerId;
        
        await _departmentRepo.SaveChangesAsync();

        return ServiceResult<DepartmentResponseDto>.LogSuccess(department.ToResponse());
    }
}