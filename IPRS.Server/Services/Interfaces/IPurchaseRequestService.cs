using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Services.Interfaces;

public interface IPurchaseRequestService
{
    Task<ServiceResult<PurchaseRequestResponseDto>> CreateRequestAsync(CreatePurchaseRequestDto requestDto, Guid userId);
    Task<ServiceResult<PurchaseRequestResponseDto>> GetRequestByIdAsync(Guid id);
    
    Task<ServiceResult<ICollection<PurchaseRequestResponseDto>>> GetFilteredRequestsForUserAsync(
        Guid userId, string role, string? status, int? queryDeptId, DateTime? fromDate, DateTime? toDate);

    Task<ServiceResult<PurchaseRequestResponseDto>> EditRequestAsync(Guid id, UpdatePurchaseRequestDto requestDto, Guid userId);
    Task<ServiceResult<PurchaseRequestResponseDto>> SubmitRequestAsync(Guid id, Guid userId);
    Task<ServiceResult<PurchaseRequestResponseDto>> CancelRequestAsync(Guid id, Guid userId);
    Task<ServiceResult<PurchaseRequestResponseDto>> ManagerApproveAsync(Guid id, ManagerReviewDto dto, Guid managerUserId);
    Task<ServiceResult<PurchaseRequestResponseDto>> ManagerRejectAsync(Guid id, ManagerRejectDto dto, Guid managerUserId);
    Task<ServiceResult<PurchaseRequestResponseDto>> FinanceApproveAsync(Guid id, FinanceApproveDto dto, Guid financeUserId);
    Task<ServiceResult<PurchaseRequestResponseDto>> FinanceRejectAsync(Guid id, FinanceRejectDto dto, Guid financeUserId);
}