using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Models;
using IPRS.Server.Repositories;

namespace IPRS.Server.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepo;

    public CategoryService(ICategoryRepository categoryRepo)
    {
        _categoryRepo = categoryRepo;
    }
    
    public async Task<IEnumerable<Category>> GetAllActiveAsync()
    {
        return  await _categoryRepo.GetAllActiveAsync();
    }

    public async Task<ServiceResult<Category>> CreateAsync(CreateCategoryDto dto)
    {
        if (await _categoryRepo.NameExistsAsync(dto.Name))
        {
            return ServiceResult<Category>.LogFailure("A category with this name already exists.");
        }

        Category category = new Category
        {
            Name = dto.Name
        };
        
        await _categoryRepo.AddAsync(category);
        await _categoryRepo.SaveChangesAsync();
        
        return ServiceResult<Category>.LogSuccess(category);
    }

    public async Task<ServiceResult<Category>> UpdateAsync(int id, UpdateCategoryDto dto)
    {
        var category = await _categoryRepo.GetByIdAsync(id);
        if (category == null) return ServiceResult<Category>.LogFailure("Category not found.");

        category.Name = dto.Name;
        category.IsActive = dto.IsActive;
        
        await _categoryRepo.SaveChangesAsync();
        return ServiceResult<Category>.LogSuccess(category);
    }
}