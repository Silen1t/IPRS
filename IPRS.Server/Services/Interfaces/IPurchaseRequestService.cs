using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Services.Interfaces;

public interface IPurchaseRequestService
{
    Task<ServiceResult<PurchaseRequestResponse>> CreateRequestAsync(CreatePurchaseRequestDto dto, Guid userId);
    Task<ServiceResult<PurchaseRequestResponse>> GetRequestByIdAsync(Guid id);
    
    Task<ServiceResult<ICollection<PurchaseRequestResponse>>> GetFilteredRequestsForUserAsync(
        Guid userId, string role, string? status, int? queryDeptId, DateTime? fromDate, DateTime? toDate);

    Task<ServiceResult<PurchaseRequestResponse>> EditRequestAsync(Guid id, UpdatePurchaseRequestDto dto, Guid userId);
    Task<ServiceResult<PurchaseRequestResponse>> SubmitRequestAsync(Guid id, Guid userId);
    Task<ServiceResult<PurchaseRequestResponse>> CancelRequestAsync(Guid id, Guid userId);
    Task<ServiceResult<PurchaseRequestResponse>> ManagerApproveAsync(Guid id, ManagerReviewDto dto, Guid managerUserId);
    Task<ServiceResult<PurchaseRequestResponse>> ManagerRejectAsync(Guid id, ManagerRejectDto dto, Guid managerUserId);
    Task<ServiceResult<PurchaseRequestResponse>> FinanceApproveAsync(Guid id, FinanceApproveDto dto);
    Task<ServiceResult<PurchaseRequestResponse>> FinanceRejectAsync(Guid id, FinanceRejectDto dto);
}