using System.ComponentModel.DataAnnotations;
using IPRS.Server.Models;

namespace IPRS.Server.DTOs;

public record CreatePurchaseRequestDto(
    [Required, StringLength(200)] string Title,
    [Required] int CategoryId,
    [Required, Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    int Quantity,
    [Required, Range(0.01, double.MaxValue, ErrorMessage = "Unit price must be greater than 0.")]
    decimal UnitPrice,
    [Required] UrgencyLevel UrgencyLevel,
    [StringLength(1000)] string? Description
);

public record UpdatePurchaseRequestDto(
    [Required] Guid Id,
    [Required, StringLength(200)] string Title,
    [Required] int CategoryId,
    [Required, Range(1, int.MaxValue)] int Quantity,
    [Required, Range(0.01, double.MaxValue)]
    decimal UnitPrice,
    [Required] UrgencyLevel UrgencyLevel,
    [StringLength(1000)] string? Description
);

public record PurchaseRequestResponse(
    Guid Id,
    string RequestNumber,
    string Title,
    string? Description,
    int Quantity,
    decimal UnitPrice,
    decimal TotalPrice,
    string UrgencyLevel,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    UserSummaryResponse RequestedBy
);

public record ManagerReviewDto(
    string? Note
);

public record ManagerRejectDto(
    [Required(ErrorMessage = "A rejection reason note is strictly required.")]
    string Note
);

public record FinanceApproveDto(
    [Required(ErrorMessage = "Purchase Order (PO) number is required.")]
    string PurchaseOrderNumber,
    string? Note
);

public record FinanceRejectDto(
    [Required(ErrorMessage = "A rejection reason note is strictly required.")]
    string Note
);