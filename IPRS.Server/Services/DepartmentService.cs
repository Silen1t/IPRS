using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Extensions;
using IPRS.Server.Models;
using IPRS.Server.Repositories.Interfaces;
using IPRS.Server.Services.Interfaces;

namespace IPRS.Server.Services;

public class DepartmentService(
    IDepartmentRepository departmentRepo,
    IUserRepository userRepo,
    ISignalRRealTimeService realTimeNotifier
) : IDepartmentService
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
        if (await departmentRepo.NameExistsAsync(request.Name))
            return ServiceResult<DepartmentResponseDto>.LogFailure(
                "A department with this name already exists. Please try another name.");

        var newDepartment = request.ToEntity();
        User? user = null;

        if (newDepartment.ManagerId != null)
        {
            user = await userRepo.GetByIdAsync((Guid)newDepartment.ManagerId);
            if (user == null)
                return ServiceResult<DepartmentResponseDto>.LogFailure(
                    $"Failed to link department manager. No active manager profile was found with ID: '{newDepartment.ManagerId}'.");

            if (user.Role != UserRole.Manager)
                return ServiceResult<DepartmentResponseDto>.LogFailure(
                    $"Authorization error. The selected user '{newDepartment.ManagerId}' does not hold the required Management privileges.");

            if (user.DepartmentId != null)
            {
                var oldDepartment = await departmentRepo.GetByIdAsync((int)user.DepartmentId);
                if (oldDepartment != null)
                {
                    oldDepartment.ManagerId = null;
                }
            }
        }

        await departmentRepo.AddAsync(newDepartment);
        await departmentRepo.SaveChangesAsync();
        if (user != null)
        {
            user.DepartmentId = newDepartment.Id;
            await userRepo.SaveChangesAsync();
        }

        await UpdateHubs();

        return ServiceResult<DepartmentResponseDto>.LogSuccess(newDepartment.ToResponse());
    }

    public async Task<ServiceResult<DepartmentResponseDto>> UpdateDepartmentByIdAsync(int id,
        UpdateDepartmentDto request)
    {
        Department? department = await departmentRepo.GetByIdAsync(id);
        if (department == null)
            return ServiceResult<DepartmentResponseDto>.LogFailure("Department not found.");

        // Track the manager currently assigned before any updates happen
        Guid? originalManagerId = department.ManagerId;

        if (request.RemoveManager)
        {
            department.ManagerId = null;

            // Clean up the user side for the manager being removed
            if (originalManagerId != null)
            {
                var oldManager = await userRepo.GetByIdAsync((Guid)originalManagerId);
                if (oldManager != null)
                {
                    oldManager.DepartmentId = null;
                }
            }
        }
        else if (request.ManagerId != null && department.ManagerId != request.ManagerId)
        {
            var newUser = await userRepo.GetByIdAsync((Guid)request.ManagerId);
            if (newUser == null)
                return ServiceResult<DepartmentResponseDto>.LogFailure(
                    $"Failed to link department manager. No active manager profile was found with ID: '{request.ManagerId}'.");

            if (newUser.Role != UserRole.Manager)
                return ServiceResult<DepartmentResponseDto>.LogFailure(
                    $"Authorization error. The selected user '{request.ManagerId}' does not hold the required Management privileges.");

            if (newUser.DepartmentId != null)
            {
                var oldDepartment = await departmentRepo.GetByIdAsync((int)newUser.DepartmentId);
                if (oldDepartment != null && oldDepartment.Id != department.Id)
                {
                    oldDepartment.ManagerId = null;
                }
            }

            if (originalManagerId != null)
            {
                var oldManager = await userRepo.GetByIdAsync((Guid)originalManagerId);
                if (oldManager != null)
                {
                    oldManager.DepartmentId = null;
                }
            }

            department.ManagerId = request.ManagerId;
            newUser.DepartmentId = department.Id;
        }

        if (request.Name != null)
        {
            var existingCollision = await departmentRepo.GetByNameAsync(request.Name);
            if (existingCollision != null && existingCollision.Id != id)
                return ServiceResult<DepartmentResponseDto>.LogFailure(
                    "A department with this name already exists. Please try another name.");

            department.Name = request.Name;
        }

        await departmentRepo.SaveChangesAsync();
        await userRepo.SaveChangesAsync();
        await UpdateHubs();

        return ServiceResult<DepartmentResponseDto>.LogSuccess(department.ToResponse());
    }

    private async Task UpdateHubs()
    {
        await realTimeNotifier.UpdateDepartmentsChangedAsync();
        await realTimeNotifier.UpdateUsersChangedAsync();
        await realTimeNotifier.UpdateDashboardChangedAsync();
    }
}