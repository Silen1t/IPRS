using System.ComponentModel.DataAnnotations;

namespace IPRS.Server.DTOs;

public record CreateCategoryDto(
    [Required, MaxLength(100)] string Name
);

public record UpdateCategoryDto(
    [Required, MaxLength(100)] string Name,
    bool IsActive
);

public record CategoryLookupDto(
    [Required, MaxLength(100)] string Name,
    int Id,
    bool IsActive
);