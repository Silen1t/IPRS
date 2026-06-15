using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Models;
using IPRS.Server.Repositories.Interfaces;
using Microsoft.IdentityModel.Tokens;
using IPRS.Server.Services.Interfaces;

namespace IPRS.Server.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _config;

    public AuthService(IUserRepository userRepository, IConfiguration config)
    {
        _userRepository = userRepository;
        _config = config;
    }

    public async Task<ServiceResult<AuthResponseDto>> LoginByEmailAsync(LoginEmailDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email.ToLower().Trim());
        if (user == null || !user.IsActive)
            return ServiceResult<AuthResponseDto>.LogFailure("Invalid email or password");

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!isPasswordValid)
            return ServiceResult<AuthResponseDto>.LogFailure("Invalid email or password");

        return Login(user);
    }

    public async Task<ServiceResult<AuthResponseDto>> LoginByEmployeeIdAsync(LoginEmployeeIdDto dto)
    {
        var user = await _userRepository.GetByEmployeeIdAsync(dto.EmployeeId);
        if (user == null || !user.IsActive)
            return ServiceResult<AuthResponseDto>.LogFailure("Invalid employee id or password");

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!isPasswordValid)
            return ServiceResult<AuthResponseDto>.LogFailure("Invalid employee id or password");

        return Login(user);
    }

    private ServiceResult<AuthResponseDto> Login(User user)
    {
        string token = GenerateJwtToken(user);

        var res = new AuthResponseDto(user.EmployeeId, user.FullName, token, user.Role.ToString());

        return ServiceResult<AuthResponseDto>.LogSuccess(res);
    }

    public async Task<ServiceResult<UserProfileDto>> GetProfileAsync(Guid id)
    {
        var user = await _userRepository.GetProfileByIdAsync(id);
        if (user == null || !user.IsActive)
            return ServiceResult<UserProfileDto>.LogFailure("User profile not found or inactive.");

        UserProfileDto profileDto = new UserProfileDto(
            user.EmployeeId,
            user.FullName,
            user.Email,
            user.Role.ToString(),
            user.DepartmentId,
            user.Department?.Name
        );

        return ServiceResult<UserProfileDto>.LogSuccess(profileDto);
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("DepartmentId", user.DepartmentId?.ToString() ?? string.Empty),
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["issuer"],
            audience: jwtSettings["Audience"],
            expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiryInMinutes"]!)),
            signingCredentials: creds,
            claims: claims
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}