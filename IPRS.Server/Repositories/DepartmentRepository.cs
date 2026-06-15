using IPRS.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace IPRS.Server.Repositories;

public class DepartmentRepository : IDepartmentRepository
{
    private readonly AppDbContext _context;

    public DepartmentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Department?> GetByIdAsync(int id)
    {
        return await _context.Departments.FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<bool> NameExistsAsync(string name)
    {
        return await _context.Departments.AnyAsync(c => c.Name == name);
    }

    public async Task AddAsync(Department department)
    {
        await  _context.Departments.AddAsync(department);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}