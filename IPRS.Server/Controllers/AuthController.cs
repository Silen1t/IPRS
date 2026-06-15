using System.Security.Claims;
using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IPRS.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login/email")]
    public async Task<IActionResult> Login([FromBody] LoginEmailRequestDto request)
    {
       var result = await _authService.LoginByEmailAsync(request);
       if (!result.Success) return Unauthorized(result.Message);
       
       return Ok(result.Data);
    }
    
    [HttpPost("login/employeeid")]
    public async Task<IActionResult> Login([FromBody] LoginEmployeeIdRequestDto request)
    {
        var result = await _authService.LoginByEmployeeIdAsync(request);
        if (!result.Success) return Unauthorized(result.Message);
       
        return Ok(result.Data);
    }
    
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid userId))
        {
            return Unauthorized("Invalid or missing user identification token.");
        }
        
        ServiceResult<UserProfileDto> result = await _authService.GetProfileAsync(userId);
        if(!result.Success) return NotFound(result.Message);
        return Ok(result.Data);
    }
    
}