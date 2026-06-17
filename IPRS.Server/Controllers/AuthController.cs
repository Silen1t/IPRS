using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace IPRS.Server.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController(IAuthService authService) : BaseApiController
{
    [HttpPost("login/email")]
    [EnableRateLimiting("auth_login")]
    public async Task<IActionResult> Login([FromBody] LoginEmailDto request)
    {
        var result = await authService.LoginByEmailAsync(request);
        if (!result.Success) return Unauthorized(result.Message);

        return Ok(result.Data);
    }

    [HttpPost("login/employeeid")]
    [EnableRateLimiting("auth_login")]
    public async Task<IActionResult> Login([FromBody] LoginEmployeeIdDto request)
    {
        var result = await authService.LoginByEmployeeIdAsync(request);
        if (!result.Success) return Unauthorized(result.Message);

        return Ok(result.Data);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        ServiceResult<UserProfileDto> result = await authService.GetProfileAsync(CurrentUserId);
        
        if (!result.Success) return NotFound(result.Message);
        return Ok(result.Data);
    }
}