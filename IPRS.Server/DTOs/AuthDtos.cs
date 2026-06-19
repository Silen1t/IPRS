using System.ComponentModel.DataAnnotations;

namespace IPRS.Server.DTOs;

public record LoginEmailDto(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record LoginEmployeeIdDto(
    [Required] string EmployeeId,
    [Required] string Password
);

public record AuthResponseDto(
    string EmployeeId,
    string FullName,
    string Token,
    string Role
);

