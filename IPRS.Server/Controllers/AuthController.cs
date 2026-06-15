using System.Security.Claims;
using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Extensions;
using IPRS.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IPRS.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login/email")]
    public async Task<IActionResult> Login([FromBody] LoginEmailDto request)
    {
        var result = await _authService.LoginByEmailAsync(request);
        if (!result.Success) return Unauthorized(result.Message);

        return Ok(result.Data);
    }

    [HttpPost("login/employeeid")]
    public async Task<IActionResult> Login([FromBody] LoginEmployeeIdDto request)
    {
        var result = await _authService.LoginByEmployeeIdAsync(request);
        if (!result.Success) return Unauthorized(result.Message);

        return Ok(result.Data);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        ServiceResult<UserProfileDto> result = await _authService.GetProfileAsync(CurrentUserId);
        
        if (!result.Success) return NotFound(result.Message);
        return Ok(result.Data);
    }
}