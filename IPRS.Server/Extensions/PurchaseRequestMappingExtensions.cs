using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Extensions;

public static class PurchaseRequestMappingExtensions
{
    public static PurchaseRequestResponseDto ToResponse(this PurchaseRequest request)
    {
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
            )
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

    public static PurchaseRequest UpdatePurchaseRequest(this PurchaseRequest request, UpdatePurchaseRequestDto requestDto)
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