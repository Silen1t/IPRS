using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Services.Interfaces;

public interface ICategoryService
{
    Task<ServiceResult<ICollection<CategoryLookupDto>>> GetAllActiveAsync();
    Task<ServiceResult<CategoryLookupDto>> CreateCategoryAsync(CreateCategoryDto dto);
    Task<ServiceResult<CategoryLookupDto>> UpdateCategoryAsync(int id, UpdateCategoryDto dto);
}