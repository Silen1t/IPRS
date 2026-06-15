using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Extensions;

public static class CategoryMappingExtensions
{
    public static CategoryLookupDto ToLookUp(this Category category)
    {
        return new CategoryLookupDto
        (
            category.Name,
            category.Id,
            category.IsActive
        );
    }
}