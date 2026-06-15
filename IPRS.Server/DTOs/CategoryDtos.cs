using System.ComponentModel.DataAnnotations;

namespace IPRS.Server.DTOs;

public record CreateCategoryDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}

public record UpdateCategoryDto
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}