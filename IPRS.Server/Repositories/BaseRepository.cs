using IPRS.Server.Repositories.Interfaces;

namespace IPRS.Server.Repositories;

public class BaseRepository : IBaseRepository
{
    protected readonly AppDbContext Context;

    protected BaseRepository(AppDbContext context)
    {
        Context = context;
    }

    public async Task SaveChangesAsync()
    {
        await Context.SaveChangesAsync();
    }

    public async Task<bool> ExistAsync<T>(Guid id) where T : class
    {
        // Dynamically looks up the entity type by its primary key
        var entity = await Context.Set<T>().FindAsync(id);
        return entity != null;
    }
}