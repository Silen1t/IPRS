using IPRS.Server.Common;
using IPRS.Server.DTOs;

namespace IPRS.Server.Services.Interfaces;

public interface IAuthService
{
    Task<ServiceResult<AuthResponseDto>> LoginByEmailAsync(LoginEmailRequestDto dto);
    Task<ServiceResult<AuthResponseDto>> LoginByEmployeeIdAsync(LoginEmployeeIdRequestDto dto);
    Task<ServiceResult<UserProfileDto>> GetProfileAsync(Guid id);
}