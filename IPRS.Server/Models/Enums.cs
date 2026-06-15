namespace IPRS.Server.Models;

public enum UrgencyLevel
{
    Low,
    Medium,
    High,
    Critical
}

public enum PurchaseRequestStatus
{
    Draft,
    Pending_Manager,
    Pending_Finance,
    Approved,
    Rejected,
    Cancelled
}

public enum UserRole
{
    Employee,
    Manager,
    Finance,
    Admin
}