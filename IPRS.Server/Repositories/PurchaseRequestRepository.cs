using IPRS.Server.Models;
using Microsoft.EntityFrameworkCore;
using IPRS.Server.Repositories.Interfaces;

namespace IPRS.Server.Repositories;

public class PurchaseRequestRepository(AppDbContext context) : BaseRepository(context), IPurchaseRequestRepository
{
    public async Task CreateAsync(PurchaseRequest purchaseRequest)
    {
        await Context.PurchaseRequests.AddAsync(purchaseRequest);
    }

    public async Task<PurchaseRequest?> GetByIdAsync(Guid id)
    {
        return await Context.PurchaseRequests
            .Include(p => p.Category)
            .Include(p => p.RequestedBy)
            .Include(p => p.ManagerActionBy)
            .Include(p => p.FinanceActionBy)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<ICollection<PurchaseRequest>> GetFilteredRequestsAsync(Guid? targetUserId,
        int? targetDepartmentId, PurchaseRequestStatus? status,
        DateTime? fromDate, DateTime? toDate)
    {
        var query = Context.PurchaseRequests
            .Include(p => p.Category)
            .Include(p => p.RequestedBy)
            .Include(p => p.Department)
            .Include(p => p.ManagerActionBy)
            .Include(p => p.FinanceActionBy)
            .AsQueryable();


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


    public async Task<int> GetNextSequenceForYearAsync(int year)
    {
        // Single atomic PostgreSQL operation:
        // - If no row exists for this year → inserts with LastSequence = 1
        // - If row exists → increments LastSequence by 1
        // - RETURNING immediately gives back the new value
        // No two concurrent calls can ever receive the same number.

        var sequenceResults = await Context.Database
            .SqlQuery<int>($"""
                                INSERT INTO "RequestNumberSequences" ("Year", "LastSequence")
                                VALUES ({year}, 1)
                                ON CONFLICT ("Year") DO UPDATE
                                SET "LastSequence" = "RequestNumberSequences"."LastSequence" + 1
                                RETURNING "LastSequence" AS "Value"
                            """)
            .ToListAsync();

        // 2. Extract the solitary calculated sequence integer safely from memory
        return sequenceResults.First();
    }
}