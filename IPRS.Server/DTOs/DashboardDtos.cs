namespace IPRS.Server.DTOs;

public class DashboardStatsDto
{
    public EmployeeDashboardStats? EmployeeStats { get; set; }
    public ManagerDashboardStats? ManagerStats { get; set; }
    public FinanceDashboardStats? FinanceStats { get; set; }
    public AdminDashboardStats? AdminStats { get; set; }
}

public class EmployeeDashboardStats
{
    public int DraftCount { get; set; }
    public int PendingCount { get; set; }
    public int ApprovedCount { get; set; }
    public int RejectedCount { get; set; }
}

public class ManagerDashboardStats
{
    public int PendingApprovalsCount { get; set; }
    public decimal DepartmentSpendThisMonth { get; set; }
}

public class FinanceDashboardStats
{
    public int PendingFinanceCount { get; set; }
    public decimal TotalApprovedSpendThisMonth { get; set; }
}

public class AdminDashboardStats
{
    public int TotalRequests { get; set; }
    public int TotalUsers { get; set; }
    public int TotalDepartments { get; set; }
}

public class ReportSummaryDto
{
    public ICollection<PurchaseRequestResponseDto> Requests { get; set; } = new List<PurchaseRequestResponseDto>();
    public decimal TotalSpendSum { get; set; }
}