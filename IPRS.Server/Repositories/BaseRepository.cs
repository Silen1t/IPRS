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

    /// <summary>
    ///  It check if the data exisit in the data base by base a class and GUID Id
    /// </summary>
    public async Task<bool> ExistAsync<T>(Guid id) where T : class
    {
        // Dynamically looks up the entity type by its primary key
        var entity = await Context.Set<T>().FindAsync(id);
        return entity != null;
    }

    /// <summary>
    ///  It check if the data exisit in the data base by base a class and int Id
    /// </summary>
    public async Task<bool> ExistAsync<T>(int id) where T : class
    {
        // Dynamically looks up the entity type by its primary key
        var entity = await Context.Set<T>().FindAsync(id);
        return entity != null;
    }
}