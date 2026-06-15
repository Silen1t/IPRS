using System.ComponentModel.DataAnnotations;

namespace IPRS.Server.Models;

public class Department
{
    [Key] public int Id { get; set; }
    [Required, MaxLength(100)] public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid? ManagerId { get; set; }
    
    // Relationships
    public User? Manager { get; set; }
    public ICollection<User> Employees { get; set; } = new List<User>();

    public ICollection<PurchaseRequest> PurchaseRequests { get; set; } = new List<PurchaseRequest>();
}