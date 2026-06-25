using System.Security.Cryptography;
using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Extensions;
using IPRS.Server.Helpers;
using IPRS.Server.Models;
using IPRS.Server.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using IPRS.Server.Services.Interfaces;

namespace IPRS.Server.Services;

public class UserService(
    IUserRepository userRepo,
    IDepartmentRepository departmentRepo,
    ISignalRRealTimeService realTimeNotifier
)
    : IUserService
{
    public async Task<ServiceResult<UserResponseDto>> RegisterUserAsync(CreateUserDto dto)
    {
        var existingUser = await userRepo.GetByEmailAsync(dto.Email.ToLower().Trim());
        if (existingUser != null) return ServiceResult<UserResponseDto>.LogFailure("Email is already registered.");

        var result = dto.ToEntity();
        if (!result.Success) return ServiceResult<UserResponseDto>.LogFailure(result.Message);

        User newUser = result.Data!;
        string secureHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        if (newUser is { DepartmentId: not null, Role: UserRole.Manager })
        {
            var targetDepartment = await departmentRepo.GetByIdAsync((int)newUser.DepartmentId);
            if (targetDepartment != null)
            {
                // If the department already has a manager, strip that manager's department link first
                if (targetDepartment.ManagerId != null)
                {
                    var previousManager = await userRepo.GetByIdAsync((Guid)targetDepartment.ManagerId);
                    if (previousManager != null)
                    {
                        previousManager.DepartmentId = null;
                    }
                }

                targetDepartment.ManagerId = newUser.Id;
            }
        }

        const int maxRetries = 3;
        for (int attempt = 0; attempt < maxRetries; attempt++)
        {
            try
            {
                newUser.EmployeeId = GenerateSecure10DigitNumber().ToString();
                newUser.PasswordHash = secureHash;

                await userRepo.AddAsync(newUser);
                await userRepo.SaveChangesAsync();

                if (newUser.DepartmentId != null)
                {
                    await departmentRepo.SaveChangesAsync();
                }

                break;
            }
            catch (DbUpdateException ex) when (IsUniqueViolation(ex))
            {
                if (ex.InnerException?.Message.Contains("Email", StringComparison.OrdinalIgnoreCase) == true)
                {
                    return ServiceResult<UserResponseDto>.LogFailure("Email is already registered.");
                }

                if (attempt == maxRetries - 1)
                    return ServiceResult<UserResponseDto>.LogFailure("Failed to generate a unique Employee ID.");
            }
        }

        await UpdateHubs();
        return ServiceResult<UserResponseDto>.LogSuccess(newUser.ToResponse());
    }

    public async Task<UserResponseDto?> GetUserByIdAsync(Guid id)
    {
        User? user = await userRepo.GetByIdAsync(id);
        if (user == null) return null;
        return user.ToResponse();
    }

    public async Task<ServiceResult<ICollection<UserResponseDto>>> GetAllUsersAsync(string? role, int? departmentId,
        bool? isActive)
    {
        UserRole? parsedRole = null;

        if (!string.IsNullOrWhiteSpace(role))
        {
            var convertedRole = EnumHelper.ConvertStringToEnum<UserRole>(role,
                $"Invalid user role. Valid options are: {string.Join(", ", Enum.GetNames(typeof(UserRole)))}");
            if (!convertedRole.Success)
            {
                return ServiceResult<ICollection<UserResponseDto>>.LogFailure(convertedRole.Message);
            }

            parsedRole = convertedRole.Data;
        }

        ICollection<User> result = await userRepo.GetFilteredAsync(parsedRole, departmentId, isActive);

        var users = result.Select(u => u.ToResponse()).ToList();

        return ServiceResult<ICollection<UserResponseDto>>.LogSuccess(users);
    }

    public async Task<ServiceResult<UserResponseDto>> UpdateUserAsync(Guid id, UpdateUserDto dto)
    {
        User? user = await userRepo.GetByIdAsync(id);
        if (user == null) return ServiceResult<UserResponseDto>.LogFailure("User not found.");

        int? originalDepartmentId = user.DepartmentId;
        UserRole originalRole = user.Role;

        if (!string.IsNullOrEmpty(dto.Role))
        {
            var convertedRole = EnumHelper.ConvertStringToEnum<UserRole>(dto.Role!, "Invalid role", true);
            if (!convertedRole.Success)
            {
                return ServiceResult<UserResponseDto>.LogFailure(convertedRole.Message);
            }

            user.Role = convertedRole.Data;
        }

        // Process Department Unlinking / Assignment Loops
        if (dto.RemoveDepartment)
        {
            user.DepartmentId = null;

            // If they were the manager of their old department, remove them as manager
            if (originalDepartmentId != null && originalRole == UserRole.Manager)
            {
                var oldDept = await departmentRepo.GetByIdAsync((int)originalDepartmentId);
                if (oldDept != null && oldDept.ManagerId == user.Id)
                {
                    oldDept.ManagerId = null;
                }
            }
        }
        else if (dto.DepartmentId.HasValue && dto.DepartmentId.Value != originalDepartmentId)
        {
            user.DepartmentId = dto.DepartmentId.Value;

            // If this user is a Manager, clear their link from the old department and wire up the new one
            if (user.Role == UserRole.Manager)
            {
                // Clean up old department
                if (originalDepartmentId != null)
                {
                    var oldDept = await departmentRepo.GetByIdAsync((int)originalDepartmentId);
                    if (oldDept != null && oldDept.ManagerId == user.Id)
                    {
                        oldDept.ManagerId = null;
                    }
                }

                var newDept = await departmentRepo.GetByIdAsync(dto.DepartmentId.Value);
                if (newDept != null)
                {
                    // Unset any previous manager assigned to the target department
                    if (newDept.ManagerId != null && newDept.ManagerId != user.Id)
                    {
                        var previousManager = await userRepo.GetByIdAsync((Guid)newDept.ManagerId);
                        if (previousManager != null)
                        {
                            previousManager.DepartmentId = null;
                        }
                    }

                    newDept.ManagerId = user.Id;
                }
            }
        }

        // Handle edge-case: Role changed from Manager to something else without changing department ID explicitly
        else if (originalRole == UserRole.Manager && user.Role != UserRole.Manager && user.DepartmentId != null)
        {
            var currentDept = await departmentRepo.GetByIdAsync((int)user.DepartmentId);
            if (currentDept != null && currentDept.ManagerId == user.Id)
            {
                currentDept.ManagerId = null;
            }
        }

        if (dto.FullName != null) user.FullName = dto.FullName;

        await userRepo.UpdateAsync(user);
        await userRepo.SaveChangesAsync();

        await departmentRepo.SaveChangesAsync();
        await UpdateHubs();

        return ServiceResult<UserResponseDto>.LogSuccess(user.ToResponse());
    }

    public async Task<ServiceResult<bool>> SetUserActiveStatusAsync(Guid id, bool isActive)
    {
        var user = await userRepo.UpdateActiveStatusAsync(id, isActive);

        if (user == null)
            return ServiceResult<bool>.LogFailure($"Failed to {(isActive ? "activate" : "deactivate")} user.");

        await userRepo.SaveChangesAsync();
        await realTimeNotifier.UpdateUsersChangedAsync();
        return ServiceResult<bool>.LogSuccess(user.IsActive);
    }

    public async Task<ServiceResult<int>> CheckUserHasDepartmentAsync(Guid userId)
    {
        int? departmentId = await userRepo.GetDepartmentByIdAsync(userId);
        return departmentId == null
            ? ServiceResult<int>.LogFailure("User don't have department.")
            : ServiceResult<int>.LogSuccess(departmentId.Value);
    }

    private async Task UpdateHubs()
    {
        await realTimeNotifier.UpdateUsersChangedAsync();
        await realTimeNotifier.UpdateDepartmentsChangedAsync();
    }

    private long GenerateSecure10DigitNumber()
    {
        // Generates a cryptographically secure random 4-byte integer
        byte[] randomBytes = new byte[4];
        RandomNumberGenerator.Fill(randomBytes);
        int rawNumber = BitConverter.ToInt32(randomBytes, 0);

        long positiveNumber = Math.Abs((long)rawNumber);

        // Force it strictly into a clean 10-digit range: 1,000,000,000 to 9,999,999,999
        return (positiveNumber % 9000000000L) + 1000000000L;
    }

    private bool IsUniqueViolation(DbUpdateException ex)
    {
        return ex.InnerException?.Message.Contains("UNIQUE") == true ||
               ex.InnerException?.Message.Contains("duplicate") == true;
    }
}