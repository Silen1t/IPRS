using System.ComponentModel.DataAnnotations;
using IPRS.Server.Models;

namespace IPRS.Server.DTOs;

public record CreatePurchaseRequestDto(
    [property: Required, StringLength(200)] string Title,
    [property: Required] int CategoryId,
    [property: Required, Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")] int Quantity,
    [property: Required, Range(0.01, double.MaxValue, ErrorMessage = "Unit price must be greater than 0.")] decimal UnitPrice,
    [property: Required] UrgencyLevel UrgencyLevel,
    [property: StringLength(1000)] string? Description
);

public record UpdatePurchaseRequestDto(
    [property: Required] Guid Id, 
    [property: Required, StringLength(200)] string Title,
    [property: Required] int CategoryId,
    [property: Required, Range(1, int.MaxValue)] int Quantity,
    [property: Required, Range(0.01, double.MaxValue)] decimal UnitPrice,
    [property: Required] UrgencyLevel UrgencyLevel,
    [property: StringLength(1000)] string? Description
);

public record ManagerReviewDto(
    string? Note
);

public record ManagerRejectDto(
    [Required(ErrorMessage = "A rejection reason note is strictly required.")] string Note
);

public record FinanceApproveDto(
    [Required(ErrorMessage = "Purchase Order (PO) number is required.")] string PurchaseOrderNumber,
    string? Note
);

public record FinanceRejectDto(
    [Required(ErrorMessage = "A rejection reason note is strictly required.")] string Note
);