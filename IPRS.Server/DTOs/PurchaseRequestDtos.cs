
namespace IPRS.Server.DTOs;

public record CreatePurchaseRequestDto(
    string Title,
    int CategoryId,
    int Quantity,
    decimal UnitPrice,
    string UrgencyLevel,
    string? Description
);

public record UpdatePurchaseRequestDto(
    Guid Id,
    string Title,
    int CategoryId,
    int Quantity,
    decimal UnitPrice,
    string UrgencyLevel,
    string? Description
);

public record PurchaseRequestResponseDto(
    Guid Id,
    string RequestNumber,
    string Title,
    string? Description,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice,
    string UrgencyLevel,
    string Status,
    int DepartmentId,
    int CategoryId,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    UserSummaryResponse RequestedBy,
    ApprovalStageDto? ManagerApproval,
    ApprovalStageDto? FinanceApproval,
    string? PurchaseOrderNumber
);

public record ManagerReviewDto(
    string? Note
);

public record ManagerRejectDto(
    string Note
);

public record FinanceApproveDto(
    string PurchaseOrderNumber,
    string? Note
);

public record FinanceRejectDto(
    string Note
);

public record ApprovalStageDto(
    UserSummaryResponse ActionBy,
    DateTime ActionAt,
    string? Note
);