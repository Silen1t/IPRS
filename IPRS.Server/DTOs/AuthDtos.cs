using System.ComponentModel.DataAnnotations;

namespace IPRS.Server.DTOs;

public record LoginEmailRequestDto
{
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public record LoginEmployeeIdRequestDto
{
    [Required] public string EmployeeId { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public record AuthResponseDto
{
    public string EmployeeId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public record UserProfileDto
{
    public string EmployeeId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
}