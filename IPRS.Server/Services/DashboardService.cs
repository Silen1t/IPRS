using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Extensions;
using IPRS.Server.Helpers;
using IPRS.Server.Models;
using IPRS.Server.Repositories.Interfaces;
using IPRS.Server.Services.Interfaces;

namespace IPRS.Server.Services;

public class DashboardService(IDashboardRepository dashboardRepo) : IDashboardService
{
    public async Task<ServiceResult<DashboardStatsDto>> GetRoleDashboardStatsAsync(Guid userId, string role)
    {
        DashboardStatsDto stats = new DashboardStatsDto();
        var localNow = DateTime.UtcNow;

        var result = EnumHelper.ConvertStringToEnum<UserRole>(role, "Invalid role", true);
        if (!result.Success) return ServiceResult<DashboardStatsDto>.LogFailure(result.Message);

        UserRole userRole = result.Data;
        switch (userRole)
        {
            case UserRole.Employee:
                var statuses = await dashboardRepo.GetEmployeeRequestStatusesAsync(userId);
                stats.EmployeeStats = statuses.ToEmployeeDashboardStats();
                break;

            case UserRole.Manager:
                var departmentId = await dashboardRepo.GetUserDepartmentIdAsync(userId);
                if (departmentId.HasValue)
                {
                    stats.ManagerStats = new ManagerDashboardStats
                    {
                        PendingApprovalsCount =
                            await dashboardRepo.GetPendingManagerRequestsCountAsync(departmentId.Value),
                        DepartmentSpendThisMonth =
                            await dashboardRepo.GetDepartmentApprovedSpendThisMonthAsync(departmentId.Value,
                                localNow.Month, localNow.Year)
                    };
                }

                break;

            case UserRole.Finance:
                stats.FinanceStats = new FinanceDashboardStats
                {
                    PendingFinanceCount = await dashboardRepo.GetPendingFinanceRequestsCountAsync(),
                    TotalApprovedSpendThisMonth =
                        await dashboardRepo.GetTotalApprovedSpendThisMonthAsync(localNow.Month, localNow.Year)
                };
                break;

            case UserRole.Admin:
                stats.AdminStats = new AdminDashboardStats
                {
                    TotalRequests = await dashboardRepo.GetTotalRequestsCountAsync(),
                    TotalUsers = await dashboardRepo.GetTotalUsersCountAsync(),
                    TotalDepartments = await dashboardRepo.GetTotalDepartmentsCountAsync()
                };
                break;
        }

        return ServiceResult<DashboardStatsDto>.LogSuccess(stats);
    }

    public async Task<ServiceResult<ReportSummaryDto>> GetFilteredReportAsync(DateTime? from, DateTime? to,
        string? status, int? departmentId)
    {
        var matchingRequests = await dashboardRepo.GetFilteredReportRequestsAsync(
            from,
            to, 
            status, 
            departmentId);


        var summary = new ReportSummaryDto
        {
            Requests = matchingRequests.Select(r => r.ToResponse()).ToList(),
            TotalSpendSum = matchingRequests.Where(r => r.Status == PurchaseRequestStatus.Approved)
                .Sum(r => r.TotalPrice)
        };

        return ServiceResult<ReportSummaryDto>.LogSuccess(summary);
    }
}