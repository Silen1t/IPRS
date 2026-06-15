using System.Security.Cryptography;
using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Extensions;
using IPRS.Server.Helpers;
using IPRS.Server.Models;
using IPRS.Server.Repositories;
using IPRS.Server.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using IPRS.Server.Services.Interfaces;

namespace IPRS.Server.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepo;

    public UserService(IUserRepository userRepo)
    {
        _userRepo = userRepo;
    }

    public async Task<ServiceResult<UserResponse>> RegisterUserAsync(CreateUserRequest request)
    {
        var existingUser = await _userRepo.GetByEmailAsync(request.Email.ToLower().Trim());
        if (existingUser != null) return ServiceResult<UserResponse>.LogFailure("Email is already registered.");

        var convertedRole = EnumHelper.ConvertStringToEnum<UserRole>(
            request.Role
            , "Invalid role"
            , true);

        if (!convertedRole.Success)
        {
            return ServiceResult<UserResponse>.LogFailure(convertedRole.Message);
        }

        var newUser = request.CreateUser();

        const int maxRetries = 3;

        for (int attempt = 0; attempt < maxRetries; attempt++)
        {
            try
            {
                newUser.EmployeeId = GenerateSecure10DigitNumber().ToString();
                await _userRepo.AddAsync(newUser);
                await _userRepo.SaveChangesAsync();
                break; // success, exit loop
            }
            catch (DbUpdateException ex) when (IsUniqueViolation(ex))
            {
                if (attempt == maxRetries - 1)
                    return ServiceResult<UserResponse>.LogFailure("Failed to generate a unique Employee ID.");
            }
        }

        return ServiceResult<UserResponse>.LogSuccess(newUser.ToResponse());
    }

    public async Task<UserResponse?> GetUserByIdAsync(Guid id)
    {
        User? user = await _userRepo.GetByIdAsync(id);
        if (user == null) return null;

        return user.ToResponse();
    }

    public async Task<ServiceResult<ICollection<UserResponse>>> GetAllUsersAsync(string? role, int? departmentId,
        bool? isActive)
    {
        UserRole? parsedRole = null;

        if (!string.IsNullOrWhiteSpace(role))
        {
            var convertedRole = EnumHelper.ConvertStringToEnum<UserRole>(role,
                $"Invalid user role. Valid options are: {string.Join(", ", Enum.GetNames(typeof(UserRole)))}");
            if (!convertedRole.Success)
            {
                return ServiceResult<ICollection<UserResponse>>.LogFailure(convertedRole.Message);
            }

            parsedRole = convertedRole.Data;
        }

        ICollection<User> result = await _userRepo.GetFilteredAsync(parsedRole, departmentId, isActive);
        
        var users = result.Select(u => u.ToResponse()).ToList();

        return ServiceResult<ICollection<UserResponse>>.LogSuccess(users);
    }

    public async Task<ServiceResult<UserResponse>> UpdateUserAsync(Guid id, UserUpdateRequest request)
    {
        User? user = await _userRepo.GetByIdAsync(id);
        if (user == null) return ServiceResult<UserResponse>.LogFailure("User not found.");
        
        if (!string.IsNullOrEmpty(request.Role))
        {
            var convertedRole = EnumHelper.ConvertStringToEnum<UserRole>(
                request.Role!
                , "Invalid role"
                , true);

            if (!convertedRole.Success)
            {
                return ServiceResult<UserResponse>.LogFailure(convertedRole.Message);
            }

            user.Role = convertedRole.Data; 
        }

        if (request.FullName != null) user.FullName = request.FullName;
        if (request.DepartmentId != null) user.DepartmentId = request.DepartmentId.Value;

        await _userRepo.UpdateAsync(user);
        await _userRepo.SaveChangesAsync();

        return ServiceResult<UserResponse>.LogSuccess(user.ToResponse());
    }

    public async Task<ServiceResult<bool>> SetUserActiveStatusAsync(Guid id, bool isActive)
    {
        var user = await _userRepo.UpdateActiveStatusAsync(id, isActive);

        if (user == null)
            return ServiceResult<bool>.LogFailure($"Failed to {(isActive ? "activate" : "deactivate")} user.");

        await _userRepo.SaveChangesAsync();
        return ServiceResult<bool>.LogSuccess(user.IsActive);
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