using IPRS.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace IPRS.Server;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<PurchaseRequest> PurchaseRequests { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.EmployeeId).IsUnique();
            entity.HasIndex(u => u.Email).IsUnique();

            entity.Property(u => u.Role)
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.HasOne(u => u.Department)
                .WithMany(d => d.Employees)
                .HasForeignKey(u => u.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull); // Safe if department drops
        });

        modelBuilder.Entity<Department>()
            .HasOne(d => d.Manager)
            .WithOne(u => u.ManagedDepartment)
            .HasForeignKey<Department>(d => d.ManagerId)
            .OnDelete(DeleteBehavior.Restrict); // Protect manager deletion status


        modelBuilder.Entity<PurchaseRequest>(entity =>
        {
            entity.HasIndex(p => p.RequestNumber)
                .IsUnique();

            entity.Property(p => p.UrgencyLevel)
                .HasConversion<string>();

            entity.Property(p => p.Status)
                .HasConversion<string>();

            entity.Property(p => p.UnitPrice).HasPrecision(18, 2);
            entity.Property(p => p.TotalPrice).HasPrecision(18, 2);

            entity.Property(p => p.TotalPrice)
                .HasComputedColumnSql("\"Quantity\" * \"UnitPrice\"", stored: true);

            // Linking Paths back to User (All set to Restrict to avoid dependency errors)
            entity.HasOne(p => p.RequestedBy)
                .WithMany(u => u.CreatedRequests)
                .HasForeignKey(p => p.RequestedById)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.ManagerActionBy)
                .WithMany(u => u.HandledManagerRequests)
                .HasForeignKey(p => p.ManagerActionById)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.FinanceActionBy)
                .WithMany(u => u.HandledFinanceRequests)
                .HasForeignKey(p => p.FinanceActionById)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.Department)
                .WithMany(d => d.PurchaseRequests)
                .HasForeignKey(p => p.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.Category)
                .WithMany(c => c.PurchaseRequests)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.ToTable(t => t.HasCheckConstraint(
                "CK_PurchaseRequest_Description_For_High_Value",
                "\"TotalPrice\" <= 50000 OR (\"Description\" IS NOT NULL AND LENGTH(TRIM(\"Description\")) > 0)"
            ));
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade); // If user is deleted, drop their alerts safely

            entity.HasOne(n => n.RelatedRequest)
                .WithMany(p => p.Notifications)
                .HasForeignKey(n => n.RelatedRequestId)
                .OnDelete(DeleteBehavior.SetNull); // Keep history if a request is archived/deleted
        });
    }
}