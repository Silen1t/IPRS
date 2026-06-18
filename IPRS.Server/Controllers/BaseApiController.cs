using System.Security.Claims;
using IPRS.Server.Extensions; // Ensure this points to where your .ToGuid() extension lives
using Microsoft.AspNetCore.Mvc;

namespace IPRS.Server.Controllers;

[ApiController]
public abstract class BaseApiController : ControllerBase
{
    protected Guid CurrentUserId => (Guid)User.FindFirst(ClaimTypes.NameIdentifier)?.Value.ToGuid("Invalid token.")!;

    protected string CurrentUserRole =>
        User.FindFirst(ClaimTypes.Role)?.Value ?? throw new UnauthorizedAccessException();

    /// <summary>
    /// Universally extracts both identity pieces at once without throwing unhandled exceptions.
    /// </summary>
    protected (bool IsSuccess, Guid UserId, string Role, int? DepartmentId, string Error) GetUserIdentity()
    {
        if (User.Identity?.IsAuthenticated != true)
            return (false, Guid.Empty, string.Empty, null, "User is not authenticated.");

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
            return (false, Guid.Empty, string.Empty, null, "Invalid user identity.");

        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

        var departmentIdStr = User.FindFirst("DepartmentId")?.Value;
        int? departmentId = int.TryParse(departmentIdStr, out var parsed) ? parsed : null;

        return (true, userId, role, departmentId, string.Empty);
    }
}