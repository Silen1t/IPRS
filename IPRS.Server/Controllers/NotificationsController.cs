using System.Security.Claims;
using IPRS.Server.DTOs;
using IPRS.Server.Extensions;
using IPRS.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IPRS.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController(INotificationService notificationService) : BaseApiController
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var notifications = await notificationService.GetAllNotificationsByUserIdAsync(CurrentUserId);
        if (!notifications.Success) return BadRequest(notifications.Message);
        return Ok(notifications.Data);
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> UpdateReadStatusNotification(Guid id,
        [FromBody] UpdateNotificationReadStatusDto request)
    {
        var status = await notificationService.UpdateNotificationReadStatus(id, request);
        if (!status.Success) return BadRequest(status.Message);
        return Ok(status.Message);
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> UpdateReadStatusAllNotifications()
    {
        var status = await notificationService
            .UpdateAllNotificationReadStatus(CurrentUserId, true);

        if (!status.Success) return BadRequest(status.Message);
        return Ok(status.Message);
    }
}