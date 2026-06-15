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
public class NotificationsController : BaseApiController
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        Guid userId = userIdClaim.ToGuid("Invalid or missing user identification token.");
        var notifications = await _notificationService.GetAllNotificationsByUserIdAsync(userId);
        if (!notifications.Success) return BadRequest(notifications.Message);
        return Ok(notifications.Data);
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> UpdateReadStatusNotification(UpdateNotificationReadStatusRequestDto request)
    {
        var status = await _notificationService.UpdateNotificationReadStatus(request);
        if (!status.Success) return BadRequest(status.Message);
        return Ok(status.Message);
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> UpdateReadStatusAllNotifications()
    {
        var status = await _notificationService
            .UpdateAllNotificationReadStatus(CurrentUserId, true);
        
        if (!status.Success) return BadRequest(status.Message);
        return Ok(status.Message);
    }
}