using IPRS.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace IPRS.Server.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Idempotent — skip if any user already exists
        if (await context.Users.AnyAsync()) return;

        // ── 1. Categories ─────────────────────────────────────────────────────
        var categories = new[]
        {
            new Category { Name = "IT Equipment" },
            new Category { Name = "Office Supplies" },
            new Category { Name = "Software Licenses" },
            new Category { Name = "Furniture" },
            new Category { Name = "Maintenance & Repair" },
            new Category { Name = "Other" }
        };
        await context.Categories.AddRangeAsync(categories);

        // ── 2. Departments (no managers yet — users don't exist yet) ───────────
        var itDept = new Department { Name = "IT Department" };
        var opsDept = new Department { Name = "Operations" };
        await context.Departments.AddRangeAsync(itDept, opsDept);

        await context.SaveChangesAsync(); // flush to get department IDs

        // ── 3. Users ──────────────────────────────────────────────────────────
        // Fixed EmployeeIds for deterministic seed data
        var admin = MakeUser(
            "1000000001",
            "System Admin",
            "admin@majd.com",
            "Admin@123",
            UserRole.Admin,
            null
        );
        
        var finance = MakeUser(
            "1000000002",
            "Finance Officer",
            "finance@majd.com",
            "Finance@123",
            UserRole.Finance,
            null
        );
        
        var managerIt = MakeUser(
            "1000000003",
            "IT Manager",
            "manager.it@majd.com",
            "Manager@123",
            UserRole.Manager,
            itDept.Id
        );

        var managerOps = MakeUser(
            "1000000004",
            "Ops Manager",
            "manager.ops@majd.com",
            "Manager@123",
            UserRole.Manager,
            opsDept.Id
        );

        var ahmed = MakeUser(
            "1000000005",
            "Ahmed Al-Saleh",
            "ahmed@majd.com",
            "Employee@123",
            UserRole.Employee,
            itDept.Id
        );

        var sara = MakeUser(
            "1000000006",
            "Sara Al-Qahtani",
            "sara@majd.com",
            "Employee@123",
            UserRole.Employee,
            opsDept.Id
        );

        await context.Users.AddRangeAsync(admin, finance, managerIt, managerOps, ahmed, sara);
        await context.SaveChangesAsync(); // flush to get user IDs

        // ── 4. Assign managers to departments ─────────────────────────────────
        itDept.ManagerId = managerIt.Id;
        opsDept.ManagerId = managerOps.Id;

        await context.SaveChangesAsync();
    }

    private static User MakeUser(
        string employeeId, string fullName, string email,
        string password, UserRole role, int? departmentId) => new()
    {
        EmployeeId = employeeId,
        FullName = fullName,
        Email = email.ToLower(),
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
        Role = role,
        DepartmentId = departmentId,
        IsActive = true
    };
}