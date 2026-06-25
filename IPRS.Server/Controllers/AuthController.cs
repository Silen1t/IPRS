using System.Security.Claims;
using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace IPRS.Server.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController(IAuthService authService, IConfiguration config) : BaseApiController
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

    [AllowAnonymous]
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken()
    {
        string expiredAccessToken = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

        if (string.IsNullOrEmpty(expiredAccessToken))
        {
            return Unauthorized(new { message = "No session context token provided." });
        }

        var result = await authService.RefreshSessionAsync(expiredAccessToken);

        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { message = result.Message });
        }

        return Ok(result.Data);
    }

    [HttpGet("session-config")]
    [AllowAnonymous]
    public IActionResult GetSessionConfiguration()
    {
        var expiryMinutes = config.GetValue<int>("JwtSettings:ExpiryInMinutes");

        var durationMs = expiryMinutes * 60 * 1000;

        return Ok(new
        {
            sessionDurationMs = durationMs,
            warningWindowSeconds = 300 // Show popup when 5 minutes are remaining
        });
    }
}