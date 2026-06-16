using IPRS.Server.DTOs;
using IPRS.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IPRS.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController(IDepartmentService departmentService) : BaseApiController
{
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetDepartments()
    {
        var responses = await departmentService.GetAllDepartmentsAsync();
        if (!responses.Success) return BadRequest(responses.Message);
        return Ok(responses.Data);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentDto request)
    {
        var result = await departmentService.CreateDepartmentAsync(request);
        if (!result.Success) return BadRequest(result.Message);
        return Ok(result.Data);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateDepartment(int id, [FromBody] UpdateDepartmentDto request)
    {
        var result = await departmentService.UpdateDepartmentByIdAsync(id, request);
        if (!result.Success) return BadRequest(result.Message);
        return Ok(result.Data);
    }
}