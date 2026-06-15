// Models/Notification.cs
using System.ComponentModel.DataAnnotations;

namespace IPRS.Server.Models;

public class Notification
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(300)] 
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid  UserId { get; set; }
    public Guid? RelatedRequestId { get; set; }
    
    // Relationships
    public User User { get; set; } = null!;
    public PurchaseRequest? RelatedRequest { get; set; }
}