namespace IPRS.Server.Repositories.Interfaces;

public interface IBaseRepository
{
    Task SaveChangesAsync();
    Task<bool> ExistAsync<T>(Guid id) where T : class;
    Task<bool> ExistAsync<T>(int id) where T : class;
}