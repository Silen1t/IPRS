using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Extensions;
using IPRS.Server.Models;
using IPRS.Server.Repositories.Interfaces;
using IPRS.Server.Services.Interfaces;

namespace IPRS.Server.Services;

public class DepartmentService(IDepartmentRepository departmentRepo) : IDepartmentService
{
    public async Task<ServiceResult<ICollection<DepartmentResponseDto>>> GetAllDepartmentsAsync()
    {
        var departments = await departmentRepo.GetAllAsync();
        var departmentsResponse = departments.Select(d => d.ToResponse()).ToArray();
        return ServiceResult<ICollection<DepartmentResponseDto>>.LogSuccess(departmentsResponse);
    }

    public async Task<ServiceResult<DepartmentResponseDto>> GetDepartmentByIdAsync(int id)
    {
        var department = await departmentRepo.GetByIdAsync(id);
        if (department == null)
        {
            return ServiceResult<DepartmentResponseDto>.LogFailure("Department not found.");
        }

        return ServiceResult<DepartmentResponseDto>.LogSuccess(department.ToResponse());
    }

    public async Task<ServiceResult<DepartmentResponseDto>> CreateDepartmentAsync(CreateDepartmentDto request)
    {
        if (!await departmentRepo.NameExistsAsync(request.Name))
            return ServiceResult<DepartmentResponseDto>.LogFailure(
                "A department with this name already exists. Please try another name.");
        var newDepartment = request.ToEntity();
        await departmentRepo.AddAsync(newDepartment);
        await departmentRepo.SaveChangesAsync();

        return ServiceResult<DepartmentResponseDto>.LogSuccess(newDepartment.ToResponse());
    }

    public async Task<ServiceResult<DepartmentResponseDto>> UpdateDepartmentByIdAsync(int id,
        UpdateDepartmentDto request)
    {
        Department? department = await departmentRepo.GetByIdAsync(id);
        if (department == null)
            return ServiceResult<DepartmentResponseDto>.LogFailure("Department not found.");


        if (request.RemoveManager)
        {
            department.ManagerId = null;
        }
        else if (request.ManagerId != null) department.ManagerId = request.ManagerId;

        if (request.Name != null) department.Name = request.Name;

        await departmentRepo.SaveChangesAsync();

        return ServiceResult<DepartmentResponseDto>.LogSuccess(department.ToResponse());
    }
}