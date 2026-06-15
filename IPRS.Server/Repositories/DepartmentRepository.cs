using IPRS.Server.Models;
using Microsoft.EntityFrameworkCore;
using IPRS.Server.Repositories.Interfaces;


namespace IPRS.Server.Repositories;

public class DepartmentRepository : BaseRepository, IDepartmentRepository
{
    public DepartmentRepository(AppDbContext context) : base(context)
    {
        
    }

    public async Task<Department?> GetByIdAsync(int id)
    {
        return await Context.Departments.FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<ICollection<Department>> GetAll()
    {
        return await Context.Departments.ToArrayAsync();
    }


    public async Task<bool> NameExistsAsync(string name)
    {
        return await Context.Departments.AnyAsync(c => c.Name == name);
    }

    public async Task AddAsync(Department department)
    {
        await  Context.Departments.AddAsync(department);
    }
}