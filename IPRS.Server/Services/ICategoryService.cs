using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Services;

public interface ICategoryService
{
    Task<IEnumerable<Category>> GetAllActiveAsync();
    Task<ServiceResult<Category>> CreateAsync(CreateCategoryDto dto);
    Task<ServiceResult<Category>> UpdateAsync(int id, UpdateCategoryDto dto);
}