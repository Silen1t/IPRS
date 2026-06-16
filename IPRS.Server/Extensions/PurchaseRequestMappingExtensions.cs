using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Extensions;

public static class PurchaseRequestMappingExtensions
{
    public static PurchaseRequestResponseDto ToResponse(this PurchaseRequest request)
    {
        ApprovalStageDto? managerApproval = null;
        if (request.ManagerActionBy != null && request.ManagerActionAt.HasValue)
        {
            managerApproval = new ApprovalStageDto(
                new UserSummaryResponse(
                    request.ManagerActionBy.Id,
                    request.ManagerActionBy.EmployeeId,
                    request.ManagerActionBy.FullName,
                    request.ManagerActionBy.Email,
                    request.ManagerActionBy.DepartmentId
                ),
                request.ManagerActionAt.Value,
                request.ManagerNote
            );
        }

        ApprovalStageDto? financeApproval = null;
        if (request.FinanceActionBy != null && request.FinanceActionAt.HasValue)
        {
            financeApproval = new ApprovalStageDto(
                new UserSummaryResponse(
                    request.FinanceActionBy.Id,
                    request.FinanceActionBy.EmployeeId,
                    request.FinanceActionBy.FullName,
                    request.FinanceActionBy.Email,
                    request.FinanceActionBy.DepartmentId
                ),
                request.FinanceActionAt.Value,
                request.FinanceNote
            );
        }

        return new PurchaseRequestResponseDto(
            request.Id,
            request.RequestNumber,
            request.Title,
            request.Description,
            request.Quantity,
            request.UnitPrice,
            request.TotalPrice,
            request.UrgencyLevel.ToString(),
            request.Status.ToString(),
            request.CreatedAt,
            request.UpdatedAt,
            new UserSummaryResponse(
                request.RequestedBy.Id,
                request.RequestedBy.EmployeeId,
                request.RequestedBy.FullName,
                request.RequestedBy.Email,
                request.RequestedBy.DepartmentId
            ),
            managerApproval,
            financeApproval,
            request.PurchaseOrderNumber
        );
    }

    public static PurchaseRequest ToEntity(this CreatePurchaseRequestDto requestDto, string requestNumber,
        Guid requestedById, int userDepartmentId)
    {
        return new PurchaseRequest()
        {
            Id = Guid.NewGuid(),
            RequestNumber = requestNumber,
            Title = requestDto.Title,
            CategoryId = requestDto.CategoryId,
            Quantity = requestDto.Quantity,
            UnitPrice = requestDto.UnitPrice,
            UrgencyLevel = requestDto.UrgencyLevel,
            Description = requestDto.Description,
            Status = PurchaseRequestStatus.Draft,
            RequestedById = requestedById,
            DepartmentId = userDepartmentId,
            CreatedAt = DateTime.UtcNow
        };
    }

    public static EmployeeDashboardStats ToEmployeeDashboardStats(this ICollection<PurchaseRequestStatus> statuses)
    {
        return new EmployeeDashboardStats()
        {
            DraftCount = statuses.Count(s => s == PurchaseRequestStatus.Draft),
            PendingCount = statuses.Count(s =>
                s is PurchaseRequestStatus.Pending_Manager or PurchaseRequestStatus.Pending_Finance),
            ApprovedCount = statuses.Count(s => s == PurchaseRequestStatus.Approved),
            RejectedCount = statuses.Count(s => s == PurchaseRequestStatus.Rejected)
        };
    }

    public static PurchaseRequest UpdatePurchaseRequest(this PurchaseRequest request,
        UpdatePurchaseRequestDto requestDto)
    {
        request.Title = requestDto.Title;
        request.CategoryId = requestDto.CategoryId;
        request.Quantity = requestDto.Quantity;
        request.UnitPrice = requestDto.UnitPrice;
        request.UrgencyLevel = requestDto.UrgencyLevel;
        request.Description = requestDto.Description;
        request.UpdatedAt = DateTime.UtcNow;
        return request;
    }
}