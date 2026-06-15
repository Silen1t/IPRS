using IPRS.Server.Common;
using IPRS.Server.DTOs;

namespace IPRS.Server.Services.Interfaces;

public interface IUserService
{
    Task<ServiceResult<UserResponseDto>> RegisterUserAsync(CreateUserDto dto);
    Task<UserResponseDto?> GetUserByIdAsync(Guid id);
    Task<ServiceResult<ICollection<UserResponseDto>>> GetAllUsersAsync(string? role, int? departmentId, bool? isActive);
    Task<ServiceResult<UserResponseDto>> UpdateUserAsync(Guid id, UserUpdateDto dto);
    Task<ServiceResult<bool>> SetUserActiveStatusAsync(Guid id, bool isActive);
}