using IPRS.Server.Models;
using Microsoft.EntityFrameworkCore;
using IPRS.Server.Repositories.Interfaces;

namespace IPRS.Server.Repositories;

public class UserRepository : BaseRepository, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context)
    {
        
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await Context.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<int?> GetDepartmentByIdAsync(Guid id)
    {
        User? user = await Context.Users.FirstOrDefaultAsync(u => u.Id == id);
        return user!.DepartmentId;
    }

    public async Task<ICollection<User>> GetFilteredAsync(UserRole? role, int? departmentId, bool? isActive)
    {
        IQueryable<User> query = Context.Users.Include(p => p.CreatedRequests);
        if (role.HasValue)
        {
            query = query.Where(u => u.Role == role.Value);
        }

        if (departmentId.HasValue)
        {
            query = query.Where(u => u.DepartmentId == departmentId.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        return await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
    }

    public async Task<User?> UpdateActiveStatusAsync(Guid id, bool isActive)
    {
        User? user = await Context.Users.FirstOrDefaultAsync(u => u.Id == id);
        
        if (user == null) return null;
        user.IsActive = isActive;

        return user;
    }

    public async Task UpdateAsync(User user)
    {
        Context.Users.Update(user);
        await Task.CompletedTask;
    }

    public async Task<User?> GetByEmployeeIdAsync(string employeeId)
    {
        return await Context.Users.FirstOrDefaultAsync(u => u.EmployeeId == employeeId);
    }

    public async Task<User?> GetProfileByIdAsync(Guid id)
    {
        return await Context.Users
            .Include(u => u.Department)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await Context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task AddAsync(User user)
    {
        await Context.Users.AddAsync(user);
    }

    public async Task<bool> Exist(Guid id)
    {
        return await Context.Users.AnyAsync(u => u.Id == id);
    }
}