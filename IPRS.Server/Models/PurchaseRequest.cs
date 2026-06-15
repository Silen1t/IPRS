// Models/PurchaseRequest.cs

using System.ComponentModel.DataAnnotations;

namespace IPRS.Server.Models;

public class PurchaseRequest : IValidatableObject
{

    [Key] public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(20)] public string RequestNumber { get; set; } = string.Empty; // PR-2026-XXXX (Unique)

    [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;

    [MaxLength(1000)] public string? Description { get; set; } = string.Empty;

    [Required] public int Quantity { get; set; } = 1;
    [Required] public decimal UnitPrice { get; set; }  // Decimal for accurate financial SAR currency
    public decimal TotalPrice { get; private set; } // Handled natively as a computed column by PostgreSQL

    public UrgencyLevel UrgencyLevel { get; set; } = UrgencyLevel.Low;
    public PurchaseRequestStatus Status { get; set; } = PurchaseRequestStatus.Draft;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Requester Links
    [Required] public Guid RequestedById { get; set; }
    public User RequestedBy { get; set; } = null!;

    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;

    [Required] public int CategoryId { get; set; }
    
    public Category Category { get; set; } = null!;

    // Approval / Action Tracks
    public Guid? ManagerActionById { get; set; }
    public User? ManagerActionBy { get; set; }
    public DateTime? ManagerActionAt { get; set; }
    [MaxLength(500)] public string? ManagerNote { get; set; }

    public Guid? FinanceActionById { get; set; }
    public User? FinanceActionBy { get; set; }
    public DateTime? FinanceActionAt { get; set; }
    [MaxLength(500)] public string? FinanceNote { get; set; }

    [MaxLength(50)] public string? PurchaseOrderNumber { get; set; }

    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        decimal runtimeTotal = Quantity * UnitPrice;
        if (runtimeTotal > 50000 && string.IsNullOrEmpty(Description))
        {
            yield return new ValidationResult(
                "Description is required for high-value purchase requests exceeding 50,000 SAR.",
                new[] { nameof(Description) }
            );
        }
    }
}