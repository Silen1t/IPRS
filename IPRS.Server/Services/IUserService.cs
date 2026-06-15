using IPRS.Server.Common;
using IPRS.Server.DTOs;

namespace IPRS.Server.Services;

public interface IUserService
{
    Task<ServiceResult<UserResponse>> RegisterUserAsync(CreateUserRequest request);
    Task<UserResponse?> GetUserByIdAsync(Guid id);
    Task<ServiceResult<ICollection<UserResponse>>> GetAllUsersAsync(string? role, int? departmentId, bool? isActive);
    Task<ServiceResult<bool>> SetUserActiveStatusAsync(Guid id, bool isActive);
}