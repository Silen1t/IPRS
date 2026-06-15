using IPRS.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IPRS.Server.Controllers;

[Authorize]
public class DashboardController : BaseApiController
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        // Pull context data directly from your verified BaseApiController configuration methods
        var userId = CurrentUserId;
        var userRole = CurrentUserRole; // assuming UserRole parameter exposes the context identity token string

        var result = await _dashboardService.GetRoleDashboardStatsAsync(userId, userRole);
        if (!result.Success) return BadRequest(result.Message);

        return Ok(result.Data);
    }

    [HttpGet("reports/requests")]
    [Authorize(Roles = "Admin,Finance")] // Strict cross-cutting restriction per Section 5.7 rules
    public async Task<IActionResult> GetReport(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? status,
        [FromQuery] int? departmentId)
    {
        var result = await _dashboardService.GetFilteredReportAsync(from, to, status, departmentId);
        if (!result.Success) return BadRequest(result.Message);

        return Ok(result.Data);
    }
}