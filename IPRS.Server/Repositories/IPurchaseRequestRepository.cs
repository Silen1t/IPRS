using IPRS.Server.Models;

namespace IPRS.Server.Repositories;

public interface IPurchaseRequestRepository
{
    Task CreatePurchaseRequestAsync(PurchaseRequest purchaseRequest);
    Task<PurchaseRequest?> GetPurchaseRequestByIdAsync(Guid id);
    
    Task<ICollection<PurchaseRequest>> GetFilteredRequestsAsync(
        Guid? targetUserId, 
        int? targetDepartmentId, 
        PurchaseRequestStatus? status, 
        DateTime? fromDate, 
        DateTime? toDate);

    Task UpdatePurchaseRequestAsync(PurchaseRequest purchaseRequest);
    Task SaveChangesAsync();
}