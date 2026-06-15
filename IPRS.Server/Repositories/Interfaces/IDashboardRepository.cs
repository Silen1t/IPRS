using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Repositories.Interfaces;

public interface IDashboardRepository : IBaseRepository
{
    Task<int?> GetUserDepartmentIdAsync(Guid userId);
    Task<ICollection<PurchaseRequestStatus>> GetEmployeeRequestStatusesAsync(Guid userId);
    Task<int> GetPendingManagerRequestsCountAsync(int departmentId);
    Task<decimal> GetDepartmentApprovedSpendThisMonthAsync(int departmentId, int month, int year);
    Task<int> GetPendingFinanceRequestsCountAsync();
    Task<decimal> GetTotalApprovedSpendThisMonthAsync(int month, int year);
    Task<int> GetTotalRequestsCountAsync();
    Task<int> GetTotalUsersCountAsync();
    Task<int> GetTotalDepartmentsCountAsync();

    Task<ICollection<PurchaseRequest>> GetFilteredReportRequestsAsync(DateTime? from, DateTime? to, string? status,
        int? departmentId);
}