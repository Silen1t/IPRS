using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Services.Interfaces;

public interface ICategoryService
{
    Task<ServiceResult<ICollection<CategoryLookupDto>>> GetAllActiveAsync();
    Task<ServiceResult<Category>> CreateCategoryAsync(CreateCategoryDto dto);
    Task<ServiceResult<Category>> UpdateCategoryAsync(int id, UpdateCategoryDto dto);
}