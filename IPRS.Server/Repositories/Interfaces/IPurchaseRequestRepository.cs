using IPRS.Server.Models;

namespace IPRS.Server.Repositories.Interfaces;

public interface IPurchaseRequestRepository : IBaseRepository
{
    Task CreateAsync(PurchaseRequest purchaseRequest);
    Task<PurchaseRequest?> GetByIdAsync(Guid id);

    Task<ICollection<PurchaseRequest>> GetFilteredRequestsAsync(
        Guid? targetUserId,
        int? targetDepartmentId,
        PurchaseRequestStatus? status,
        DateTime? fromDate,
        DateTime? toDate);

    Task UpdateAsync(PurchaseRequest purchaseRequest);
}