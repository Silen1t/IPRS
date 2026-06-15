using IPRS.Server.Common;
using IPRS.Server.DTOs;

namespace IPRS.Server.Services.Interfaces;

public interface IAuthService
{
    Task<ServiceResult<AuthResponseDto>> LoginByEmailAsync(LoginEmailDto dto);
    Task<ServiceResult<AuthResponseDto>> LoginByEmployeeIdAsync(LoginEmployeeIdDto dto);
    Task<ServiceResult<UserProfileDto>> GetProfileAsync(Guid id);
}