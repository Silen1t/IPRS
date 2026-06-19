using IPRS.Server.Models;

namespace IPRS.Server.Repositories.Interfaces;

public interface IDepartmentRepository : IBaseRepository
{
    Task<Department?> GetByIdAsync(int id);
    Task<ICollection<Department>> GetAllAsync();
    Task<bool> NameExistsAsync(string name);
    Task AddAsync(Department department);
}