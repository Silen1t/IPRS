using IPRS.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace IPRS.Server.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;
    
    public CategoryRepository(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<IEnumerable<Category>> GetAllActiveAsync()
    {
       return await _context.Categories.Where(c => c.IsActive).ToListAsync();
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

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}