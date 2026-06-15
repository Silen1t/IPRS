using IPRS.Server.Models;

namespace IPRS.Server.Repositories.Interfaces;

public interface IUserRepository : IBaseRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<int?> GetDepartmentByIdAsync(Guid id);
    Task<ICollection<User>> GetFilteredAsync(UserRole? role, int? departmentId, bool? isActive);
    Task<User?> UpdateActiveStatusAsync(Guid id, bool isActive);
    Task UpdateAsync(User user);
    Task<User?> GetByEmployeeIdAsync(string employeeId);
    Task<User?> GetProfileByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task AddAsync(User user);


}