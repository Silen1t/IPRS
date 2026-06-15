namespace IPRS.Server.Repositories;
using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Models;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllActiveAsync();
    Task<Category?> GetByIdAsync(int id);
    Task<bool> NameExistsAsync(string name);
    Task AddAsync(Category category);
    Task SaveChangesAsync();
}