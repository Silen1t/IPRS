using IPRS.Server.Models;
using Microsoft.EntityFrameworkCore;
using IPRS.Server.Repositories.Interfaces;


namespace IPRS.Server.Repositories;

public class DepartmentRepository(AppDbContext context) : BaseRepository(context), IDepartmentRepository
{
    public async Task<Department?> GetByIdAsync(int id)
    {
        return await Context.Departments.FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<ICollection<Department>> GetAllAsync()
    {
        return await Context.Departments.ToArrayAsync();
    }


    public async Task AddAsync(Department department)
    {
        await  Context.Departments.AddAsync(department);
    }
}