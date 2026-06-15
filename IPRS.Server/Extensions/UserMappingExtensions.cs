using IPRS.Server.DTOs;
using IPRS.Server.Helpers;
using IPRS.Server.Models;

namespace IPRS.Server.Extensions;

public static class UserMappingExtensions
{
    public static UserResponse ToResponse(this User user)
    {
        return new UserResponse(
            user.Id,
            user.EmployeeId,
            user.FullName,
            user.Email.ToLower().Trim(),
            user.Role.ToString(),
            user.DepartmentId,
            user.IsActive,
            user.CreatedAt
        );
    }

    public static User CreateUser(this CreateUserRequest request)
    {
        var convertedRole = EnumHelper.ConvertStringToEnum<UserRole>(
            request.Role
            , "Invalid role"
            , true);

        if (!convertedRole.Success)
        {
            return null!;
        }
        string secureHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        
        return new User()
        {
            FullName = request.FullName,
            Email = request.Email.ToLower().Trim(),
            PasswordHash = secureHash,
            Role = convertedRole.Data,
            DepartmentId = request.DepartmentId,
        };
    }
}