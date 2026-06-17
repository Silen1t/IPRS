using IPRS.Server.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using IPRS.Server.Services.Interfaces;

namespace IPRS.Server.Controllers;

[Authorize]
[ApiController]
[Route("categories")]
public class CategoriesController(ICategoryService categoryService) : BaseApiController
{
    // GET: api/categories
    [HttpGet]
    public async Task<IActionResult> GetActive()
    {
        var categories = await categoryService.GetAllActiveAsync();
        return Ok(categories.Data);
    }

    // POST: api/categories
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
    {
        var result = await categoryService.CreateCategoryAsync(dto);
        if (!result.Success) return BadRequest(result.Message);

        return CreatedAtAction(nameof(GetActive), new { id = result.Data!.Id }, result.Data);
    }

    // PUT: api/categories/5
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto dto)
    {
        var result = await categoryService.UpdateCategoryAsync(id, dto);
        if (!result.Success) return BadRequest(result.Message);

        return Ok(result.Data);
    }
}