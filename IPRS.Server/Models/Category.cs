using System.ComponentModel.DataAnnotations;

namespace IPRS.Server.Models;

public class Category
{
    [Key]
    public int Id { get; set; }
    [Required, MaxLength(100)] public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    
    // Relationships
    public ICollection<PurchaseRequest> PurchaseRequests { get; set; } = new List<PurchaseRequest>();
}