using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Extensions;
using IPRS.Server.Helpers;
using IPRS.Server.Models;
using IPRS.Server.Repositories.Interfaces;
using IPRS.Server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IPRS.Server.Services;

public class PurchaseRequestService : IPurchaseRequestService
{
    private readonly IPurchaseRequestRepository _requestRepo;
    private readonly IUserRepository _userRepo;
    private readonly INotificationService _notificationService;

    public PurchaseRequestService(IPurchaseRequestRepository requestRepo, IUserRepository userRepo,
        INotificationService notificationService)
    {
        _requestRepo = requestRepo;
        _userRepo = userRepo;
        _notificationService = notificationService;
    }

    public async Task<ServiceResult<PurchaseRequestResponse>> CreateRequestAsync(CreatePurchaseRequestDto requestDto,
        Guid userId)
    {
        // 1. Business Logic Validation
        decimal totalPrice = requestDto.Quantity * requestDto.UnitPrice;
        if (totalPrice > 50000 && string.IsNullOrWhiteSpace(requestDto.Description))
        {
            return ServiceResult<PurchaseRequestResponse>.LogFailure(
                "A justification description is required for requests exceeding 50,000 SAR.");
        }

        int userDepartmentId = (int)(await _userRepo.GetDepartmentByIdAsync(userId))!;
        int currentYear = DateTime.UtcNow.Year;

        string requestNumber;
        PurchaseRequest purchaseRequest = null!;

        int maxRetries = 3;
        int retryCount = 0;
        bool isSaved = false;

        while (!isSaved && retryCount < maxRetries)
        {
            try
            {
                int currentYearCount = await _requestRepo.CountByYearAsync(currentYear);
                int nextSeq = currentYearCount + 1;

                requestNumber = $"PR-{currentYear}-{nextSeq:D4}";
                purchaseRequest = requestDto.CreatePurchaseRequest(requestNumber, userId, userDepartmentId);

                await _requestRepo.CreateAsync(purchaseRequest);
                await _requestRepo.SaveChangesAsync();

                isSaved = true;
            }
            catch (DbUpdateException)
            {
                retryCount++;
                if (retryCount >= maxRetries)
                {
                    return ServiceResult<PurchaseRequestResponse>.LogFailure(
                        "System is busy processing requests. Please try submitting again.");
                }

                await Task.Delay(50 * retryCount);
            }
        }

        var createdRequest = await _requestRepo.GetByIdAsync(purchaseRequest.Id);

        return ServiceResult<PurchaseRequestResponse>.LogSuccess(createdRequest!.ToResponse());
    }

    public async Task<ServiceResult<PurchaseRequestResponse>> GetRequestByIdAsync(Guid id)
    {
        var request = await _requestRepo.GetByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequestResponse>.LogFailure("Purchase request not found.");
        return ServiceResult<PurchaseRequestResponse>.LogSuccess(request.ToResponse());
    }

    public async Task<ServiceResult<ICollection<PurchaseRequestResponse>>> GetFilteredRequestsForUserAsync(
        Guid userId, string role, string? status, int? queryDeptId, DateTime? fromDate, DateTime? toDate)
    {
        Guid? filterUserId = null;
        int? filterDeptId = queryDeptId;

        if (role == "Employee")
        {
            filterUserId = userId;
            filterDeptId = null;
        }
        else if (role == "Manager")
        {
            int managerDeptId = (int)(await _userRepo.GetDepartmentByIdAsync(userId))!;
            filterDeptId = managerDeptId;
        }

        PurchaseRequestStatus? parsedStatus = null;

        if (!string.IsNullOrWhiteSpace(status))
        {
            var convertedStatus = EnumHelper.ConvertStringToEnum<PurchaseRequestStatus>(status,
                $"Invalid status code. Valid options are: {string.Join(", ", Enum.GetNames(typeof(PurchaseRequestStatus)))}");

            if (!convertedStatus.Success)
            {
                return ServiceResult<ICollection<PurchaseRequestResponse>>.LogFailure(convertedStatus.Message);
            }

            parsedStatus = convertedStatus.Data;
        }

        var results =
            await _requestRepo.GetFilteredRequestsAsync(filterUserId, filterDeptId, parsedStatus, fromDate, toDate);

        var responseDtos = results.Select(r => r.ToResponse()).ToList();
        return ServiceResult<ICollection<PurchaseRequestResponse>>.LogSuccess(responseDtos);
    }

    public async Task<ServiceResult<PurchaseRequestResponse>> EditRequestAsync(Guid id,
        UpdatePurchaseRequestDto requestDto,
        Guid userId)
    {
        var request = await _requestRepo.GetByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequestResponse>.LogFailure("Purchase request not found.");
        if (request.RequestedById != userId)
            return ServiceResult<PurchaseRequestResponse>.LogFailure("Access Denied: You do not own this request.");
        if (request.Status != PurchaseRequestStatus.Draft)
            return ServiceResult<PurchaseRequestResponse>.LogFailure("Only requests in DRAFT status can be modified.");

        decimal totalPrice = requestDto.Quantity * requestDto.UnitPrice;
        if (totalPrice > 50000 && string.IsNullOrWhiteSpace(requestDto.Description))
        {
            return ServiceResult<PurchaseRequestResponse>.LogFailure(
                "A justification description is required for requests exceeding 50,000 SAR.");
        }

        request = request.UpdatePurchaseRequest(requestDto);

        await _requestRepo.SaveChangesAsync();
        return ServiceResult<PurchaseRequestResponse>.LogSuccess(request.ToResponse());
    }

    public async Task<ServiceResult<PurchaseRequestResponse>> SubmitRequestAsync(Guid id, Guid userId)
    {
        var request = await _requestRepo.GetByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequestResponse>.LogFailure("Purchase request not found.");
        if (request.RequestedById != userId) return ServiceResult<PurchaseRequestResponse>.LogFailure("Access Denied.");
        if (request.Status != PurchaseRequestStatus.Draft)
            return ServiceResult<PurchaseRequestResponse>.LogFailure("Only DRAFT requests can be submitted.");

        request.Status = PurchaseRequestStatus.Pending_Manager;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepo.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(new CreateNotificationDto
            (
                request.RequestedById,
                $"Your purchase request '{request.Title}' ({request.RequestNumber}) has been submitted and is pending department manager review.",
                request.Id
            )
        );

        return ServiceResult<PurchaseRequestResponse>.LogSuccess(request.ToResponse());
    }

    public async Task<ServiceResult<PurchaseRequestResponse>> CancelRequestAsync(Guid id, Guid userId)
    {
        var request = await _requestRepo.GetByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequestResponse>.LogFailure("Purchase request not found.");
        if (request.RequestedById != userId) return ServiceResult<PurchaseRequestResponse>.LogFailure("Access Denied.");

        if (request.Status != PurchaseRequestStatus.Draft && request.Status != PurchaseRequestStatus.Pending_Manager)
        {
            return ServiceResult<PurchaseRequestResponse>.LogFailure(
                "Requests can only be cancelled during DRAFT or PENDING_MANAGER states.");
        }

        request.Status = PurchaseRequestStatus.Cancelled;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepo.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(new CreateNotificationDto
            (
                request.RequestedById,
                $"Your purchase request '{request.Title}' ({request.RequestNumber}) was successfully cancelled.",
                request.Id
            )
        );

        return ServiceResult<PurchaseRequestResponse>.LogSuccess(request.ToResponse());
    }

    public async Task<ServiceResult<PurchaseRequestResponse>> ManagerApproveAsync(Guid id, ManagerReviewDto dto,
        Guid managerUserId)
    {
        var request = await _requestRepo.GetByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequestResponse>.LogFailure("Purchase request not found.");
        if (request.Status != PurchaseRequestStatus.Pending_Manager)
            return ServiceResult<PurchaseRequestResponse>.LogFailure("Request is not waiting for manager review.");

        string? deptError = await ValidateAuthorityDepartmentAsync(request.DepartmentId, managerUserId);
        if (deptError != null) return ServiceResult<PurchaseRequestResponse>.LogFailure(deptError);

        request.ManagerActionById = managerUserId;
        request.Status = PurchaseRequestStatus.Pending_Finance;
        request.ManagerNote = dto.Note;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepo.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(new CreateNotificationDto
            (
                request.RequestedById,
                $"Your purchase request '{request.Title}' ({request.RequestNumber}) was approved by your manager and forwarded to Finance.",
                request.Id
            )
        );

        return ServiceResult<PurchaseRequestResponse>.LogSuccess(request.ToResponse());
    }

    public async Task<ServiceResult<PurchaseRequestResponse>> ManagerRejectAsync(Guid id, ManagerRejectDto dto,
        Guid managerUserId)
    {
        var request = await _requestRepo.GetByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequestResponse>.LogFailure("Purchase request not found.");
        if (request.Status != PurchaseRequestStatus.Pending_Manager)
            return ServiceResult<PurchaseRequestResponse>.LogFailure("Request is not waiting for manager review.");

        string? deptError = await ValidateAuthorityDepartmentAsync(request.DepartmentId, managerUserId);
        if (deptError != null) return ServiceResult<PurchaseRequestResponse>.LogFailure(deptError);

        request.ManagerActionById = managerUserId;
        request.Status = PurchaseRequestStatus.Rejected;
        request.ManagerNote = dto.Note;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepo.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(new CreateNotificationDto
            (
                request.RequestedById,
                $"Your purchase request '{request.Title}' ({request.RequestNumber}) was rejected by your manager. Reason: {dto.Note}",
                request.Id
            )
        );

        return ServiceResult<PurchaseRequestResponse>.LogSuccess(request.ToResponse());
    }

    public async Task<ServiceResult<PurchaseRequestResponse>> FinanceApproveAsync(Guid id, FinanceApproveDto dto,
        Guid financeUserId)
    {
        var request = await _requestRepo.GetByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequestResponse>.LogFailure("Purchase request not found.");
        if (request.Status != PurchaseRequestStatus.Pending_Finance)
            return ServiceResult<PurchaseRequestResponse>.LogFailure(
                "Request is not waiting for final finance review.");

        request.FinanceActionById = financeUserId;
        request.Status = PurchaseRequestStatus.Approved;
        request.PurchaseOrderNumber = dto.PurchaseOrderNumber;
        request.FinanceNote = dto.Note;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepo.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(new CreateNotificationDto
            (
                request.RequestedById,
                $"🎉 Your purchase request '{request.Title}' ({request.RequestNumber}) has been fully approved! PO Number: {dto.PurchaseOrderNumber}.",
                request.Id
            )
        );

        return ServiceResult<PurchaseRequestResponse>.LogSuccess(request.ToResponse());
    }

    public async Task<ServiceResult<PurchaseRequestResponse>> FinanceRejectAsync(Guid id, FinanceRejectDto dto,
        Guid financeUserId)
    {
        var request = await _requestRepo.GetByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequestResponse>.LogFailure("Purchase request not found.");
        if (request.Status != PurchaseRequestStatus.Pending_Finance)
            return ServiceResult<PurchaseRequestResponse>.LogFailure("Request is not waiting for finance review.");

        request.FinanceActionById = financeUserId;
        request.Status = PurchaseRequestStatus.Rejected;
        request.FinanceNote = dto.Note;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepo.SaveChangesAsync();

        await _notificationService.CreateNotificationAsync(new CreateNotificationDto
            (
                request.RequestedById,
                $"Your purchase request '{request.Title}' ({request.RequestNumber}) was rejected by Finance. Reason: {dto.Note}",
                request.Id
            )
        );

        return ServiceResult<PurchaseRequestResponse>.LogSuccess(request.ToResponse());
    }

    private async Task<string?> ValidateAuthorityDepartmentAsync(int requestDeptId, Guid userId)
    {
        var departmentIdResult = await _userRepo.GetDepartmentByIdAsync(userId);

        if (departmentIdResult == null)
        {
            return "Access Denied: Manager department identity profile could not be found.";
        }

        int userDeptId = (int)departmentIdResult;

        if (requestDeptId != userDeptId)
        {
            return
                "Access Denied: Managers are only authorized to review purchase requests within their own department.";
        }

        return null;
    }
}