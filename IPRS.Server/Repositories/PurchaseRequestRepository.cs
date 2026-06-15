using IPRS.Server.Models;
using Microsoft.EntityFrameworkCore;
using IPRS.Server.Repositories.Interfaces;

namespace IPRS.Server.Repositories;

public class PurchaseRequestRepository :BaseRepository,  IPurchaseRequestRepository
{
    public PurchaseRequestRepository(AppDbContext context) : base(context)
    {
        
    }

    public async Task CreateAsync(PurchaseRequest purchaseRequest)
    {
        await Context.PurchaseRequests.AddAsync(purchaseRequest);
    }

    public async Task<PurchaseRequest?> GetByIdAsync(Guid id)
    {
        return await Context.PurchaseRequests
            .Include(p => p.Category)
            .Include(p => p.RequestedBy)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<ICollection<PurchaseRequest>> GetFilteredRequestsAsync(Guid? targetUserId,
        int? targetDepartmentId, PurchaseRequestStatus? status,
        DateTime? fromDate, DateTime? toDate)
    {
        IQueryable<PurchaseRequest> query = Context.PurchaseRequests.Include(p => p.Category);

        if (targetUserId.HasValue)
        {
            query = query.Where(p => p.RequestedById == targetUserId.Value);
        }

        if (targetDepartmentId.HasValue)
        {
            query = query.Where(p => p.DepartmentId == targetDepartmentId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(p => p.CreatedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(p => p.CreatedAt <= toDate.Value);
        }

        return await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
    }
    
    
    public async Task<int> CountByYearAsync(int year)
    {
        return await Context.PurchaseRequests
            .CountAsync(r => r.CreatedAt.Year == year);
    }
}