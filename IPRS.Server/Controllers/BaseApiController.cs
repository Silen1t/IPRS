using System.Security.Claims;
using IPRS.Server.Extensions; // Ensure this points to where your .ToGuid() extension lives
using Microsoft.AspNetCore.Mvc;

namespace IPRS.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected Guid CurrentUserId => (Guid)User.FindFirst(ClaimTypes.NameIdentifier)?.Value.ToGuid("Invalid token.")!;
    protected string CurrentUserRole => User.FindFirst(ClaimTypes.Role)?.Value ?? throw new UnauthorizedAccessException();

    /// <summary>
    /// Universally extracts both identity pieces at once without throwing unhandled exceptions.
    /// </summary>
    protected (bool IsSuccess, Guid UserId, string Role, string? Error) GetUserIdentity()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var roleStr = User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrWhiteSpace(roleStr))
        {
            return (false, Guid.Empty, string.Empty, "Missing authorization permissions role.");
        }

        if (string.IsNullOrWhiteSpace(userIdStr) || !Guid.TryParse(userIdStr, out Guid userId))
        {
            return (false, Guid.Empty, string.Empty, "Invalid or missing user identification token.");
        }

        return (true, userId, roleStr, null);
    }
}