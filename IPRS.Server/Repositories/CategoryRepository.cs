using IPRS.Server.Models;
using Microsoft.EntityFrameworkCore;
using IPRS.Server.Repositories.Interfaces;

namespace IPRS.Server.Repositories;

public class CategoryRepository : BaseRepository, ICategoryRepository
{
    public CategoryRepository(AppDbContext context) : base(context)
    {
        
    }

    public async Task<IEnumerable<Category>> GetAllActiveAsync()
    {
        return await _context.Categories.Where(c => c.IsActive)
            .Include(c => c.PurchaseRequests)
            .ToListAsync();
    }

    public async Task<Category?> GetByIdAsync(int id)
    {
        return await _context.Categories.FindAsync(id);
    }

    public async Task<bool> NameExistsAsync(string name)
    {
        return await _context.Categories.AnyAsync(c => c.Name == name);
    }

    public async Task AddAsync(Category category)
    {
        await _context.Categories.AddAsync(category);
    }
}