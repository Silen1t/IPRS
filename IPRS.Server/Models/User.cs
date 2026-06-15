using System.ComponentModel.DataAnnotations;

namespace IPRS.Server.Models;

public class User
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    [MaxLength(10)] public string EmployeeId { get; set; } = string.Empty;

    [Required, MaxLength(100)] public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(150), EmailAddress] public string Email { get; set; } = string.Empty;

    [Required, MaxLength(255)] public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public int? DepartmentId { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Relationships
    
    public Department? Department { get; set; }
    public Department? ManagedDepartment { get; set; } 
    
    public ICollection<PurchaseRequest> HandledManagerRequests { get; set; } = new List<PurchaseRequest>();
    public ICollection<PurchaseRequest> HandledFinanceRequests { get; set; } = new List<PurchaseRequest>();
    public ICollection<PurchaseRequest> CreatedRequests { get; set; } = new List<PurchaseRequest>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}