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
        await _context.PurchaseRequests.AddAsync(purchaseRequest);
    }

    public async Task<PurchaseRequest?> GetByIdAsync(Guid id)
    {
        return await _context.PurchaseRequests
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<ICollection<PurchaseRequest>> GetFilteredRequestsAsync(Guid? targetUserId,
        int? targetDepartmentId, PurchaseRequestStatus? status,
        DateTime? fromDate, DateTime? toDate)
    {
        IQueryable<PurchaseRequest> query = _context.PurchaseRequests.Include(p => p.Category);

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

    public async Task<ICollection<PurchaseRequest>> GetPurchaseRequestsByUserIdAsync(Guid userId)
    {
        return await _context.PurchaseRequests
            .Where(p => p.RequestedById == userId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    // Returns everything cleanly for Admins and Finance
    public async Task<ICollection<PurchaseRequest>> GetAllPurchaseRequestsAsync()
    {
        return await _context.PurchaseRequests
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task UpdateAsync(PurchaseRequest purchaseRequest)
    {
        _context.PurchaseRequests.Update(purchaseRequest);
        await Task.CompletedTask;
    }
}