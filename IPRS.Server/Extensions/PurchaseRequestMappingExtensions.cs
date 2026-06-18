using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Helpers;
using IPRS.Server.Models;

namespace IPRS.Server.Extensions;

public static class PurchaseRequestMappingExtensions
{
    public static PurchaseRequestResponseDto ToResponse(this PurchaseRequest request)
    {
        ApprovalStageDto? managerApproval = null;
        if (request is { ManagerActionBy: not null, ManagerActionAt: not null })
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
        if (request is { FinanceActionBy: not null, FinanceActionAt: not null })
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
            request.DepartmentId,
            request.CategoryId,
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

    public static ServiceResult<PurchaseRequest> ToEntity(this CreatePurchaseRequestDto requestDto,
        string requestNumber,
        Guid requestedById, int userDepartmentId)
    {
        var urgencyLevel =
            EnumHelper.ConvertStringToEnum<UrgencyLevel>(requestDto.UrgencyLevel, "Invalid urgency", true);
        if (!urgencyLevel.Success)
        {
            return ServiceResult<PurchaseRequest>.LogFailure(urgencyLevel.Message);
        }

        var purchaseRequest = new PurchaseRequest()
        {
            Id = Guid.NewGuid(),
            RequestNumber = requestNumber,
            Title = requestDto.Title,
            CategoryId = requestDto.CategoryId,
            Quantity = requestDto.Quantity,
            UnitPrice = requestDto.UnitPrice,
            UrgencyLevel = urgencyLevel.Data,
            Description = requestDto.Description,
            Status = PurchaseRequestStatus.Draft,
            RequestedById = requestedById,
            DepartmentId = userDepartmentId,
            CreatedAt = DateTime.UtcNow
        };
        return ServiceResult<PurchaseRequest>.LogSuccess(purchaseRequest);
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
        var urgencyLevel = EnumHelper.ConvertStringToEnum<UrgencyLevel>(requestDto.UrgencyLevel, "");
        request.Title = requestDto.Title;
        request.CategoryId = requestDto.CategoryId;
        request.Quantity = requestDto.Quantity;
        request.UnitPrice = requestDto.UnitPrice;
        request.UrgencyLevel = urgencyLevel.Data;
        request.Description = requestDto.Description;
        request.UpdatedAt = DateTime.UtcNow;
        return request;
    }
}