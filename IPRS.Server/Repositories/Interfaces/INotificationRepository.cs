using IPRS.Server.DTOs;
using IPRS.Server.Models;

namespace IPRS.Server.Repositories.Interfaces;

public interface INotificationRepository : IBaseRepository
{
    Task<ICollection<Notification>> GetAllByUserIdAsync(Guid userId);
    Task<Notification?> GetByIdAsync(Guid notificationId);
    Task<Notification?> UpdateReadStatus(Guid notificationId, bool readStatus);
    Task UpdateAllReadStatus(Guid userId, bool readStatus);
    Task CreateAsync(Notification notification);
    
}