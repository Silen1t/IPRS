using IPRS.Server.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IPRS.Server.Repositories;

public class BaseRepository : IBaseRepository
{
    protected readonly AppDbContext _context;

    protected BaseRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
        await Task.CompletedTask;
    }

    public async Task<bool> ExistAsync<T>(Guid id) where T : class
    {
        // Dynamically looks up the entity type by its primary key
        var entity = await _context.Set<T>().FindAsync(id);
        return entity != null;
    }
}