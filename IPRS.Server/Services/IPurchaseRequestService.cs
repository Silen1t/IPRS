using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Services;

public interface IPurchaseRequestService
{
    Task<ServiceResult<PurchaseRequest>> CreateRequestAsync(CreatePurchaseRequestDto dto, Guid userId);
    Task<ServiceResult<PurchaseRequest>> GetRequestByIdAsync(Guid id);
    
    Task<ServiceResult<ICollection<PurchaseRequest>>> GetFilteredRequestsForUserAsync(
        Guid userId, string role, string? status, int? queryDeptId, DateTime? fromDate, DateTime? toDate);

    Task<ServiceResult<PurchaseRequest>> EditRequestAsync(Guid id, UpdatePurchaseRequestDto dto, Guid userId);
    Task<ServiceResult<PurchaseRequest>> SubmitRequestAsync(Guid id, Guid userId);
    Task<ServiceResult<PurchaseRequest>> CancelRequestAsync(Guid id, Guid userId);
    Task<ServiceResult<PurchaseRequest>> ManagerApproveAsync(Guid id, ManagerReviewDto dto, Guid managerUserId);
    Task<ServiceResult<PurchaseRequest>> ManagerRejectAsync(Guid id, ManagerRejectDto dto, Guid managerUserId);
    Task<ServiceResult<PurchaseRequest>> FinanceApproveAsync(Guid id, FinanceApproveDto dto);
    Task<ServiceResult<PurchaseRequest>> FinanceRejectAsync(Guid id, FinanceRejectDto dto);
}