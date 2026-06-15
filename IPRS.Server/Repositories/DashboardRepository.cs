using IPRS.Server.Helpers;
using IPRS.Server.Models;
using IPRS.Server.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IPRS.Server.Repositories;

public class DashboardRepository : BaseRepository, IDashboardRepository
{
    public DashboardRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<int?> GetUserDepartmentIdAsync(Guid userId)
    {
        return await Context.Users
            .Where(u => u.Id == userId)
            .Select(u => u.DepartmentId)
            .FirstOrDefaultAsync();
    }

    public async Task<ICollection<PurchaseRequestStatus>> GetEmployeeRequestStatusesAsync(Guid userId)
    {
        return await Context.PurchaseRequests
            .Where(r => r.RequestedById == userId)
            .Select(r => r.Status)
            .ToListAsync();
    }

    public async Task<int> GetPendingManagerRequestsCountAsync(int departmentId)
    {
        return await Context.PurchaseRequests
            .CountAsync(r => r.DepartmentId == departmentId
                             && r.Status == PurchaseRequestStatus.Pending_Manager
            );
    }

    public async Task<decimal> GetDepartmentApprovedSpendThisMonthAsync(int departmentId, int month, int year)
    {
        return await Context.PurchaseRequests
            .Where(r => r.DepartmentId == departmentId &&
                        r.Status == PurchaseRequestStatus.Approved &&
                        r.CreatedAt.Month == month &&
                        r.CreatedAt.Year == year)
            .SumAsync(r => r.TotalPrice);
    }

    public async Task<int> GetPendingFinanceRequestsCountAsync()
    {
        return await Context.PurchaseRequests
            .CountAsync(r => r.Status == PurchaseRequestStatus.Pending_Finance);
    }

    public async Task<decimal> GetTotalApprovedSpendThisMonthAsync(int month, int year)
    {
        return await Context.PurchaseRequests
            .Where(r => r.Status == PurchaseRequestStatus.Approved &&
                        r.CreatedAt.Month == month &&
                        r.CreatedAt.Year == year)
            .SumAsync(r => r.TotalPrice);
    }

    public async Task<int> GetTotalRequestsCountAsync()
    {
        return await Context.PurchaseRequests.CountAsync();
    }

    public async Task<int> GetTotalUsersCountAsync()
    {
        return await Context.Users.CountAsync();
    }

    public async Task<int> GetTotalDepartmentsCountAsync()
    {
        return await Context.Departments.CountAsync();
    }

    public async Task<ICollection<PurchaseRequest>> GetFilteredReportRequestsAsync(DateTime? from, DateTime? to,
        string? status, int? departmentId)
    {
        var query = Context.PurchaseRequests
            .Include(r => r.Category)
            .Include(r => r.RequestedBy)
            .AsQueryable();

        if (from.HasValue)
            query = query.Where(r => r.CreatedAt >= from.Value);

        if (to.HasValue)
            query = query.Where(r => r.CreatedAt <= to.Value);

        if (!string.IsNullOrWhiteSpace(status))
        {
            var result = EnumHelper.ConvertStringToEnum<PurchaseRequestStatus>(status, "Invalid status", true);
            if (!result.Success) return null;
            query = query.Where(r => r.Status == result.Data);
        }


        if (departmentId.HasValue)
            query = query.Where(r => r.DepartmentId == departmentId.Value);

        return await query.ToListAsync();
    }
}