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

public class AuthService(IUserRepository userRepo, IConfiguration config)
    : IAuthService
{
    public async Task<ServiceResult<AuthResponseDto>> LoginByEmailAsync(LoginEmailDto dto)
    {
        var user = await userRepo.GetByEmailAsync(dto.Email.ToLower().Trim());
        if (user == null || !user.IsActive)
            return ServiceResult<AuthResponseDto>.LogFailure("Invalid email or password");

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!isPasswordValid)
            return ServiceResult<AuthResponseDto>.LogFailure("Invalid email or password");

        return Login(user);
    }

    public async Task<ServiceResult<AuthResponseDto>> LoginByEmployeeIdAsync(LoginEmployeeIdDto dto)
    {
        var user = await userRepo.GetByEmployeeIdAsync(dto.EmployeeId);
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
        var user = await userRepo.GetProfileByIdAsync(id);
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
        var jwtSettings = config.GetSection("JwtSettings");
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
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiryInMinutes"]!)),
            signingCredentials: creds,
            claims: claims
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }


    public async Task<ServiceResult<AuthResponseDto>> RefreshSessionAsync(string expiredAccessToken)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            // Build validation parameters targeting "JwtSettings" to match appsettings.json
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true,
                ValidAudience = config.GetValue<string>("JwtSettings:Audience"),

                ValidateIssuer = true,
                ValidIssuer = config.GetValue<string>("JwtSettings:Issuer"),

                ValidateIssuerSigningKey = true,
                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(config.GetValue<string>("JwtSettings:Key") ?? string.Empty)),

                // Allow expired tokens to pass validation thresholds safely
                ValidateLifetime = false
            };

            // Extract the claims principal
            var principal = tokenHandler.ValidateToken(expiredAccessToken, tokenValidationParameters,
                out SecurityToken securityToken);

            // Verify encryption signature matches standard parameters
            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,
                    StringComparison.InvariantCultureIgnoreCase))
            {
                return ServiceResult<AuthResponseDto>.LogFailure("Invalid token encryption signature mapping.", 401);
            }

            // Extract User ID Guid claim
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out Guid parsedUserId))
            {
                return ServiceResult<AuthResponseDto>.LogFailure("Invalid token security context profile structure.",
                    401);
            }

            // Execute the database token updating and rotation operations
            var result = await RefreshToken(parsedUserId);

            return result;
        }
        catch (Exception ex)
        {
            return ServiceResult<AuthResponseDto>.LogFailure(
                $"An internal error occurred during token verification sync: {ex.Message}", 500);
        }
    }

    private async Task<ServiceResult<AuthResponseDto>> RefreshToken(Guid userId)
    {
        try
        {
            var user = await userRepo.GetByIdAsync(userId);

            if (user == null)
            {
                return ServiceResult<AuthResponseDto>.LogFailure("User profile context directory not found.", 404);
            }

            var activeToken = GenerateJwtToken(user);

            if (string.IsNullOrEmpty(activeToken))
            {
                return ServiceResult<AuthResponseDto>.LogFailure(
                    "Session authorization has expired. Please re-authenticate.", 401);
            }

            var res = new AuthResponseDto(user.EmployeeId, user.FullName, activeToken, user.Role.ToString());

            return ServiceResult<AuthResponseDto>.LogSuccess(res, "Session token environment extended successfully.");
        }
        catch (Exception ex)
        {
            return ServiceResult<AuthResponseDto>.LogFailure($"Critical validation exception: {ex.Message}", 500);
        }
    }
}