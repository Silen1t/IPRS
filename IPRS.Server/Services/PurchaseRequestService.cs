using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Models;
using IPRS.Server.Repositories;
using Microsoft.AspNetCore.Http.HttpResults;

namespace IPRS.Server.Services;

public class PurchaseRequestService : IPurchaseRequestService
{
    private readonly IPurchaseRequestRepository _requestRepo;
    private readonly IUserRepository _userRepo;

    public PurchaseRequestService(IPurchaseRequestRepository requestRepo, IUserRepository userRepo)
    {
        _requestRepo = requestRepo;
        _userRepo = userRepo;
    }

    public async Task<ServiceResult<PurchaseRequest>> CreateRequestAsync(CreatePurchaseRequestDto dto, Guid userId)
    {
        decimal totalPrice = dto.Quantity * dto.UnitPrice;
        if (totalPrice > 50000 && string.IsNullOrWhiteSpace(dto.Description))
        {
            return ServiceResult<PurchaseRequest>.LogFailure(
                "A justification description is required for requests exceeding 50,000 SAR.");
        }

        var allRequests = await _requestRepo.GetFilteredRequestsAsync(
            null,
            null,
            null,
            null,
            null
        );

        int currentYear = DateTime.UtcNow.Year;
        int nextSeq = allRequests.Count(r => r.CreatedAt.Year == currentYear) + 1;

        int userDepartmentId = (int)(await _userRepo.GetDepartmentIdByIdAsync(userId))!;

        var purchaseRequest = new PurchaseRequest
        {
            Id = Guid.NewGuid(),
            RequestNumber = $"PR-{currentYear}-{nextSeq:D4}",
            Title = dto.Title,
            CategoryId = dto.CategoryId,
            Quantity = dto.Quantity,
            UnitPrice = dto.UnitPrice,
            UrgencyLevel = dto.UrgencyLevel,
            Description = dto.Description,
            Status = PurchaseRequestStatus.Draft,
            RequestedById = userId,
            DepartmentId = userDepartmentId,
            CreatedAt = DateTime.UtcNow
        };

        await _requestRepo.CreatePurchaseRequestAsync(purchaseRequest);
        await _requestRepo.SaveChangesAsync();

        return ServiceResult<PurchaseRequest>.LogSuccess(purchaseRequest);
    }

    public async Task<ServiceResult<PurchaseRequest>> GetRequestByIdAsync(Guid id)
    {
        var request = await _requestRepo.GetPurchaseRequestByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequest>.LogFailure("Purchase request not found.");
        return ServiceResult<PurchaseRequest>.LogSuccess(request);
    }

    public async Task<ServiceResult<ICollection<PurchaseRequest>>> GetFilteredRequestsForUserAsync(
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
            int managerDeptId = (int)(await _userRepo.GetDepartmentIdByIdAsync(userId))!;
            filterDeptId = managerDeptId;
        }

        PurchaseRequestStatus? parsedStatus = null;

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<PurchaseRequestStatus>(status, ignoreCase: true, out var statusCode))
            {
                return ServiceResult<ICollection<PurchaseRequest>>.LogFailure(
                    $"Invalid status code. Valid options are: {string.Join(", ", Enum.GetNames(typeof(PurchaseRequestStatus)))}");
            }

            parsedStatus = statusCode;
        }

        var results =
            await _requestRepo.GetFilteredRequestsAsync(filterUserId, filterDeptId, parsedStatus, fromDate, toDate);
        return ServiceResult<ICollection<PurchaseRequest>>.LogSuccess(results);
    }

    public async Task<ServiceResult<PurchaseRequest>> EditRequestAsync(Guid id, UpdatePurchaseRequestDto dto,
        Guid userId)
    {
        var request = await _requestRepo.GetPurchaseRequestByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequest>.LogFailure("Purchase request not found.");
        if (request.RequestedById != userId)
            return ServiceResult<PurchaseRequest>.LogFailure("Access Denied: You do not own this request.");
        if (request.Status != PurchaseRequestStatus.Draft)
            return ServiceResult<PurchaseRequest>.LogFailure("Only requests in DRAFT status can be modified.");

        decimal totalPrice = dto.Quantity * dto.UnitPrice;
        if (totalPrice > 50000 && string.IsNullOrWhiteSpace(dto.Description))
        {
            return ServiceResult<PurchaseRequest>.LogFailure(
                "A justification description is required for requests exceeding 50,000 SAR.");
        }

        request.Title = dto.Title;
        request.CategoryId = dto.CategoryId;
        request.Quantity = dto.Quantity;
        request.UnitPrice = dto.UnitPrice;
        request.UrgencyLevel = dto.UrgencyLevel;
        request.Description = dto.Description;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepo.UpdatePurchaseRequestAsync(request);
        await _requestRepo.SaveChangesAsync();
        return ServiceResult<PurchaseRequest>.LogSuccess(request);
    }

    public async Task<ServiceResult<PurchaseRequest>> SubmitRequestAsync(Guid id, Guid userId)
    {
        var request = await _requestRepo.GetPurchaseRequestByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequest>.LogFailure("Purchase request not found.");
        if (request.RequestedById != userId) return ServiceResult<PurchaseRequest>.LogFailure("Access Denied.");
        if (request.Status != PurchaseRequestStatus.Draft)
            return ServiceResult<PurchaseRequest>.LogFailure("Only DRAFT requests can be submitted.");

        request.Status = PurchaseRequestStatus.Pending_Manager;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepo.UpdatePurchaseRequestAsync(request);
        await _requestRepo.SaveChangesAsync();
        return ServiceResult<PurchaseRequest>.LogSuccess(request);
    }

    public async Task<ServiceResult<PurchaseRequest>> CancelRequestAsync(Guid id, Guid userId)
    {
        var request = await _requestRepo.GetPurchaseRequestByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequest>.LogFailure("Purchase request not found.");
        if (request.RequestedById != userId) return ServiceResult<PurchaseRequest>.LogFailure("Access Denied.");

        if (request.Status != PurchaseRequestStatus.Draft && request.Status != PurchaseRequestStatus.Pending_Manager)
        {
            return ServiceResult<PurchaseRequest>.LogFailure(
                "Requests can only be cancelled during DRAFT or PENDING_MANAGER states.");
        }

        request.Status = PurchaseRequestStatus.Cancelled;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepo.UpdatePurchaseRequestAsync(request);
        await _requestRepo.SaveChangesAsync();
        return ServiceResult<PurchaseRequest>.LogSuccess(request);
    }

    public async Task<ServiceResult<PurchaseRequest>> ManagerApproveAsync(Guid id, ManagerReviewDto dto,
        Guid managerUserId)
    {
        var request = await _requestRepo.GetPurchaseRequestByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequest>.LogFailure("Purchase request not found.");
        if (request.Status != PurchaseRequestStatus.Pending_Manager)
            return ServiceResult<PurchaseRequest>.LogFailure("Request is not waiting for manager review.");

        string? deptError = await ValidateAuthorityDepartmentAsync(request.DepartmentId, managerUserId);
        if (deptError != null) return ServiceResult<PurchaseRequest>.LogFailure(deptError);

        request.Status = PurchaseRequestStatus.Pending_Finance;
        request.ManagerNote = dto.Note;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepo.UpdatePurchaseRequestAsync(request);
        await _requestRepo.SaveChangesAsync();
        return ServiceResult<PurchaseRequest>.LogSuccess(request);
    }

    public async Task<ServiceResult<PurchaseRequest>> ManagerRejectAsync(Guid id, ManagerRejectDto dto,
        Guid managerUserId)
    {
        var request = await _requestRepo.GetPurchaseRequestByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequest>.LogFailure("Purchase request not found.");
        if (request.Status != PurchaseRequestStatus.Pending_Manager)
            return ServiceResult<PurchaseRequest>.LogFailure("Request is not waiting for manager review.");
    
        string? deptError = await ValidateAuthorityDepartmentAsync(request.DepartmentId, managerUserId);
        if (deptError != null) return ServiceResult<PurchaseRequest>.LogFailure(deptError);
        
        request.Status = PurchaseRequestStatus.Rejected;
        request.ManagerNote = dto.Note;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepo.UpdatePurchaseRequestAsync(request);
        await _requestRepo.SaveChangesAsync();
        return ServiceResult<PurchaseRequest>.LogSuccess(request);
    }

    public async Task<ServiceResult<PurchaseRequest>> FinanceApproveAsync(Guid id, FinanceApproveDto dto)
    {
        var request = await _requestRepo.GetPurchaseRequestByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequest>.LogFailure("Purchase request not found.");
        if (request.Status != PurchaseRequestStatus.Pending_Finance)
            return ServiceResult<PurchaseRequest>.LogFailure("Request is not waiting for final finance review.");
        
        request.Status = PurchaseRequestStatus.Approved;
        request.PurchaseOrderNumber = dto.PurchaseOrderNumber;
        request.FinanceNote = dto.Note;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepo.UpdatePurchaseRequestAsync(request);
        await _requestRepo.SaveChangesAsync();
        return ServiceResult<PurchaseRequest>.LogSuccess(request);
    }

    public async Task<ServiceResult<PurchaseRequest>> FinanceRejectAsync(Guid id, FinanceRejectDto dto)
    {
        var request = await _requestRepo.GetPurchaseRequestByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequest>.LogFailure("Purchase request not found.");
        if (request.Status != PurchaseRequestStatus.Pending_Finance)
            return ServiceResult<PurchaseRequest>.LogFailure("Request is not waiting for finance review.");

        request.Status = PurchaseRequestStatus.Rejected;
        request.FinanceNote = dto.Note;
        request.UpdatedAt = DateTime.UtcNow;

        await _requestRepo.UpdatePurchaseRequestAsync(request);
        await _requestRepo.SaveChangesAsync();
        return ServiceResult<PurchaseRequest>.LogSuccess(request);
    }
    
    private async Task<string?> ValidateAuthorityDepartmentAsync(int requestDeptId, Guid UserId)
    {
        var departmentIdResult = await _userRepo.GetDepartmentIdByIdAsync(UserId);
    
        if (departmentIdResult == null)
        {
            return "Access Denied: Manager department identity profile could not be found.";
        }

        int userDeptId = (int)departmentIdResult;

        if (requestDeptId != userDeptId)
        {
            return "Access Denied: Managers are only authorized to review purchase requests within their own department.";
        }

        return null; // Vector is clean, no validation errors!
    }
}