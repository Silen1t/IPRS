using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Extensions;

public static class PurchaseRequestMappingExtensions
{
    public static PurchaseRequestResponse ToResponse(this PurchaseRequest request)
    {
        return new PurchaseRequestResponse(
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
            )
        );
    }

    public static PurchaseRequest CreatePurchaseRequest(this CreatePurchaseRequestDto dto, string requestNumber,
        Guid requestedById, int userDepartmentId)
    {
        return new PurchaseRequest()
        {
            Id = Guid.NewGuid(),
            RequestNumber = requestNumber,
            Title = dto.Title,
            CategoryId = dto.CategoryId,
            Quantity = dto.Quantity,
            UnitPrice = dto.UnitPrice,
            UrgencyLevel = dto.UrgencyLevel,
            Description = dto.Description,
            Status = PurchaseRequestStatus.Draft,
            RequestedById = requestedById,
            DepartmentId = userDepartmentId,
            CreatedAt = DateTime.UtcNow
        };
    }

    public static PurchaseRequest UpdatePurchaseRequest(this PurchaseRequest request, UpdatePurchaseRequestDto dto)
    {
        request.Title = dto.Title;
        request.CategoryId = dto.CategoryId;
        request.Quantity = dto.Quantity;
        request.UnitPrice = dto.UnitPrice;
        request.UrgencyLevel = dto.UrgencyLevel;
        request.Description = dto.Description;
        request.UpdatedAt = DateTime.UtcNow;
        return request;
    }
}