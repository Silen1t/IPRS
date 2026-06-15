using IPRS.Server.Models;

namespace IPRS.Server.Repositories;

public interface IDepartmentRepository
{
    Task<Department?> GetByIdAsync(int id);
    Task<bool> NameExistsAsync(string name);
    Task AddAsync(Department department);
    Task SaveChangesAsync();
}