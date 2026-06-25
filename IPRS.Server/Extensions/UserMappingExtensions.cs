using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Helpers;
using IPRS.Server.Models;

namespace IPRS.Server.Extensions;

public static class UserMappingExtensions
{
    public static UserResponseDto ToResponse(this User user)
    {
        return new UserResponseDto(
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


    public static ServiceResult<User?> ToEntity(this CreateUserDto dto)
    {
        var convertedRole = EnumHelper.ConvertStringToEnum<UserRole>(
            dto.Role
            , "Invalid role"
            , true);

        if (!convertedRole.Success)
        {
            return ServiceResult<User?>.LogFailure(convertedRole.Message);
        }

        User user = new User()
        {
            FullName = dto.FullName,
            Email = dto.Email.ToLower().Trim(),
            Role = convertedRole.Data,
            DepartmentId = dto.DepartmentId,
        };
        return ServiceResult<User?>.LogSuccess(user);
    }
}