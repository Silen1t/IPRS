using IPRS.Server.Common;
using IPRS.Server.DTOs;

namespace IPRS.Server.Services.Interfaces;

public interface IDashboardService
{
    Task<ServiceResult<DashboardStatsDto>> GetRoleDashboardStatsAsync(Guid userId, string role);

    Task<ServiceResult<ReportSummaryDto>> GetFilteredReportAsync(DateTime? from, DateTime? to,
        string? status, int? departmentId);
}