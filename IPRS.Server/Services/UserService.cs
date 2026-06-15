using System.Security.Cryptography;
using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Models;
using IPRS.Server.Repositories;
using Microsoft.EntityFrameworkCore;

namespace IPRS.Server.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<ServiceResult<UserResponse>> RegisterUserAsync(CreateUserRequest request)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email.ToLower().Trim());
        if (existingUser != null) return ServiceResult<UserResponse>.LogFailure("Email is already registered.");

        string secureHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
            return ServiceResult<UserResponse>.LogFailure($"Invalid role: {request.Role}");

        var newUser = new User
        {
            FullName = request.FullName,
            Email = request.Email.ToLower().Trim(),
            PasswordHash = secureHash,
            Role = role,
            DepartmentId = request.DepartmentId
        };


        const int maxRetries = 3;

        for (int attempt = 0; attempt < maxRetries; attempt++)
        {
            try
            {
                newUser.EmployeeId = GenerateSecure10DigitNumber().ToString();
                await _userRepository.AddAsync(newUser);
                await _userRepository.SaveChangesAsync();
                break; // success, exit loop
            }
            catch (DbUpdateException ex) when (IsUniqueViolation(ex))
            {
                if (attempt == maxRetries - 1)
                    return ServiceResult<UserResponse>.LogFailure("Failed to generate a unique Employee ID.");
            }
        }

        UserResponse userResponse = new UserResponse(newUser.Id, newUser.EmployeeId, newUser.FullName,
            newUser.Email.ToLower(), newUser.Role.ToString(), newUser.DepartmentId, newUser.IsActive,
            newUser.CreatedAt);

        return ServiceResult<UserResponse>.LogSuccess(userResponse);
    }

    public async Task<UserResponse?> GetUserByIdAsync(Guid id)
    {
        User? user = await _userRepository.GetByIdAsync(id);
        if (user == null) return null;

        return new UserResponse(user.Id, user.EmployeeId, user.FullName, user.Email, user.Role.ToString(),
            user.DepartmentId, user.IsActive, user.CreatedAt);
    }

    public async Task<ServiceResult<ICollection<UserResponse>>> GetAllUsersAsync(string? role, int? departmentId,
        bool? isActive)
    {
        UserRole? parsedRole = null;

        if (!string.IsNullOrWhiteSpace(role))
        {
            if (!Enum.TryParse<UserRole>(role, ignoreCase: true, out var userRole))
            {
                return ServiceResult<ICollection<UserResponse>>.LogFailure(
                    $"Invalid user role. Valid options are: {string.Join(", ", Enum.GetNames(typeof(UserRole)))}");
            }

            parsedRole = userRole;
        }

        ICollection<User> result = await _userRepository.GetFilteredUserAsync(parsedRole, departmentId, isActive);
        var users = result.Select(ConvertUserToUserResponse).ToList();

        return ServiceResult<ICollection<UserResponse>>.LogSuccess(users);
    }

    public async Task<ServiceResult<bool>> SetUserActiveStatusAsync(Guid id, bool isActive)
    {
        var user = await _userRepository.SetUserActiveStatusAsync(id, isActive);

        if (user == null)
            return ServiceResult<bool>.LogFailure($"Failed to {(isActive ? "activate" : "deactivate")} user.");

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

    private UserResponse ConvertUserToUserResponse(User user)
    {
        string role = user.Role.ToString();
        return new UserResponse(user.Id, user.EmployeeId, user.FullName, user.Email, role, user.DepartmentId,
            user.IsActive, user.CreatedAt);
    }
}