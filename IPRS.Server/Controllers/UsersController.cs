using IPRS.Server.DTOs;
using IPRS.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IPRS.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? role, [FromQuery] int? departmentId,
        [FromQuery] bool? isActive)
    {
        var result = await _userService.GetAllUsersAsync(role, departmentId, isActive);

        if (!result.Success) return BadRequest(result.Message);

        return Ok(result.Data);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        var createdUserDto = await _userService.RegisterUserAsync(dto);
        if (!createdUserDto.Success) return BadRequest(createdUserDto.Message);
        return CreatedAtAction(nameof(GetById), new { id = createdUserDto.Data!.Id }, createdUserDto);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userDto = await _userService.GetUserByIdAsync(id);
        if (userDto == null) return NotFound(new { message = "Employee card not found." });
        return Ok(userDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UserUpdateDto dto)
    {
        var res = await _userService.UpdateUserAsync(id, dto);

        if (!res.Success) return BadRequest(res.Message);

        return Ok(res.Data);
    }

    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        return await SetUserActiveStatusAsync(id, false);
    }

    [HttpPatch("{id}/activate")]
    public async Task<IActionResult> Activate(Guid id)
    {
        return await SetUserActiveStatusAsync(id, true);
    }

    private async Task<IActionResult> SetUserActiveStatusAsync(Guid id, bool isActive)
    {
        var result = await _userService.SetUserActiveStatusAsync(id, isActive);
        if (!result.Success) return BadRequest(result.Message);
        return Ok(result.Data);
    }
}