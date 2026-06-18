using IPRS.Server.Models;
using IPRS.Server.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IPRS.Server.Repositories;

public class NotificationRepository(AppDbContext context) : BaseRepository(context), INotificationRepository
{
    public async Task<ICollection<Notification>> GetAllByUserIdAsync(Guid userId)
    {
        return await Context.Notifications.Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt).ToListAsync();
    }

    public async Task<Notification?> GetByIdAsync(Guid notificationId)
    {
        return await Context.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId);
    }


    public async Task UpdateAllReadStatus(Guid userId, bool readStatus)
    {
        await Context.Notifications
            .Where(n => n.UserId == userId)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(n => n.IsRead, readStatus)
            );
    }

    public async Task CreateAsync(Notification notification)
    {
        await Context.Notifications.AddAsync(notification);
    }
}