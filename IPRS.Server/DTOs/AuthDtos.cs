using System.ComponentModel.DataAnnotations;

namespace IPRS.Server.DTOs;

public record LoginEmailDto(
    [Required, EmailAddress] string Email,
     string Password
);

public record LoginEmployeeIdDto(
     string EmployeeId,
     string Password
);

public record AuthResponseDto(
    string EmployeeId,
    string FullName,
    string Token,
    string Role
);

