using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Extensions;
using IPRS.Server.Models;
using IPRS.Server.Repositories.Interfaces;
using IPRS.Server.Services.Interfaces;

namespace IPRS.Server.Services;

public class CategoryService(ICategoryRepository categoryRepo) : ICategoryService
{
    public async Task<ServiceResult<ICollection<CategoryLookupDto>>> GetAllActiveAsync()
    {
        var categories = await categoryRepo.GetAllActiveAsync();

        // 🎯 Map only the required data properties to the DTO
        var dtos = categories.Select(c => c.ToLookUp()).ToArray();
        return ServiceResult<ICollection<CategoryLookupDto>>.LogSuccess(dtos);
    }

    public async Task<ServiceResult<CategoryLookupDto>> CreateCategoryAsync(CreateCategoryDto dto)
    {
        if (await categoryRepo.NameExistsAsync(dto.Name))
        {
            return ServiceResult<CategoryLookupDto>.LogFailure("A category with this name already exists.");
        }

        Category category = new Category
        {
            Name = dto.Name
        };

        await categoryRepo.AddAsync(category);
        await categoryRepo.SaveChangesAsync();

        return ServiceResult<CategoryLookupDto>.LogSuccess(category.ToLookUp());
    }

    public async Task<ServiceResult<CategoryLookupDto>> UpdateCategoryAsync(int id, UpdateCategoryDto dto)
    {
        var category = await categoryRepo.GetByIdAsync(id);
        if (category == null) return ServiceResult<CategoryLookupDto>.LogFailure("Category not found.");

        category.Name = dto.Name;
        category.IsActive = dto.IsActive;

        await categoryRepo.SaveChangesAsync();
        return ServiceResult<CategoryLookupDto>.LogSuccess(category.ToLookUp());
    }
}