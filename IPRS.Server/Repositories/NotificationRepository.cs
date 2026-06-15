using IPRS.Server.Models;
using IPRS.Server.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IPRS.Server.Repositories;

public class NotificationRepository : BaseRepository, INotificationRepository
{
    public NotificationRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<ICollection<Notification>> GetAllByUserIdAsync(Guid userId)
    {
        return await _context.Notifications.Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt).ToListAsync();
    }

    public async Task<Notification?> UpdateReadStatus(Guid notificationId, bool readStatus)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId);
        
        if (notification == null) return null;
    
        notification.IsRead = readStatus;
    
        return notification;
    }

    public async Task UpdateAllReadStatus(Guid userId, bool readStatus)
    {
        await _context.Notifications
            .Where(n => n.UserId == userId)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(n => n.IsRead, readStatus)
            );
    }
}