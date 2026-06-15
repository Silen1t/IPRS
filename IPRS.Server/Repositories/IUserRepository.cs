using IPRS.Server.Models;

namespace IPRS.Server.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<int?> GetDepartmentIdByIdAsync(Guid id);
    Task<ICollection<User>> GetFilteredUserAsync(UserRole? role, int? departmentId, bool? isActive);
    Task<User?> SetUserActiveStatusAsync(Guid id, bool isActive);
    Task<User?> GetByEmployeeIdAsync(string employeeId);
    Task<User?> GetProfileByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task AddAsync(User user);
    Task SaveChangesAsync();
}