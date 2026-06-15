using IPRS.Server.DTOs;
using IPRS.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IPRS.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService superClass)
    {
        _categoryService = superClass;
    }

    // GET: api/categories
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetActive()
    {
        var categories = await _categoryService.GetAllActiveAsync();
        return Ok(categories);
    }

    // POST: api/categories
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
    {
        var result = await _categoryService.CreateAsync(dto);
        if (!result.Success) return BadRequest(result.Message);

        return CreatedAtAction(nameof(GetActive), new { id = result.Data!.Id }, result.Data);
    }

    // PUT: api/categories/5
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryDto dto)
    {
        var result = await _categoryService.UpdateAsync(id, dto);
        if (!result.Success) return BadRequest(result.Message);

        return Ok(result.Data);
    }
}