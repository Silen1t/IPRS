using IPRS.Server.Models;
using Microsoft.EntityFrameworkCore;
using IPRS.Server.Repositories.Interfaces;

namespace IPRS.Server.Repositories;

public class CategoryRepository(AppDbContext context) : BaseRepository(context), ICategoryRepository
{
    public async Task<IEnumerable<Category>> GetAllActiveAsync()
    {
        return await Context.Categories.Where(c => c.IsActive).ToListAsync();
    }

    public async Task<Category?> GetByIdAsync(int id)
    {
        return await Context.Categories.FindAsync(id);
    }

    public async Task<bool> NameExistsAsync(string name)
    {
        return await Context.Categories.AnyAsync(c => c.Name == name);
    }

    public async Task AddAsync(Category category)
    {
        await Context.Categories.AddAsync(category);
    }
}