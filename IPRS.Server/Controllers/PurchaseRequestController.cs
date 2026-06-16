using System.Security.Claims;
using IPRS.Server.DTOs;
using IPRS.Server.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IPRS.Server.Controllers;

[ApiController]
[Route("api/requests")] // 🎯 Section 7: Base URL route set exactly to /api/requests
[Authorize]
public class PurchaseRequestController(IPurchaseRequestService requestService) : BaseApiController
{
    /// <summary>
    /// GET /api/requests
    /// Returns requests filtered by role. Supports query params: status, departmentId, from, to.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] int? departmentId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var identity = GetUserIdentity();
        if (!identity.IsSuccess) return Unauthorized(identity.Error);

        var result = await requestService.GetFilteredRequestsForUserAsync(
            identity.UserId,
            identity.Role,
            status,
            departmentId,
            from,
            to
        );

        // 🎯 Catch the parsing/validation failures logged by your service layer
        if (!result.Success)
        {
            return BadRequest(result.Message);
        }

        return Ok(result.Data);
    }

    /// <summary>
    /// GET /api/requests/{id}
    /// Full detail of a single request.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await requestService.GetRequestByIdAsync(id);
        if (!result.Success) return NotFound(result.Message);
        return Ok(result.Data);
    }

    /// <summary>
    /// POST /api/requests
    /// Access: Employee. Create a new request (status = DRAFT).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> Create([FromBody] CreatePurchaseRequestDto requestDto)
    {
        var identity = GetUserIdentity();
        if (!identity.IsSuccess) return Unauthorized(identity.Error);

        var result = await requestService.CreateRequestAsync(requestDto, identity.UserId);
        if (!result.Success) return BadRequest(result.Message);

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    /// <summary>
    /// PUT /api/requests/{id}
    /// Access: Employee. Edit a request. Only allowed if status = DRAFT.
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> Edit(Guid id, [FromBody] UpdatePurchaseRequestDto requestDto)
    {
        var identity = GetUserIdentity();
        if (!identity.IsSuccess) return Unauthorized(identity.Error);

        var result = await requestService.EditRequestAsync(id, requestDto, identity.UserId);
        if (!result.Success) return BadRequest(result.Message);

        return Ok(result.Data);
    }

    /// <summary>
    /// POST /api/requests/{id}/submit
    /// Access: Employee. Submit request → PENDING_MANAGER.
    /// </summary>
    [HttpPost("{id:guid}/submit")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> Submit(Guid id)
    {
        var identity = GetUserIdentity();
        if (!identity.IsSuccess) return Unauthorized(identity.Error);

        var result = await requestService.SubmitRequestAsync(id, identity.UserId);
        if (!result.Success) return BadRequest(result.Message);

        return Ok(result.Data);
    }

    /// <summary>
    /// POST /api/requests/{id}/cancel
    /// Access: Employee. Cancel request (DRAFT or PENDING_MANAGER only).
    /// </summary>
    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var identity = GetUserIdentity();
        if (!identity.IsSuccess) return Unauthorized(identity.Error);

        var result = await requestService.CancelRequestAsync(id, identity.UserId);
        if (!result.Success) return BadRequest(result.Message);

        return Ok(result.Data);
    }

    /// <summary>
    /// POST /api/requests/{id}/manager-approve
    /// Access: Manager. Approve → PENDING_FINANCE. Body: { note?: string }.
    /// </summary>
    [HttpPost("{id:guid}/manager-approve")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> ManagerApprove(Guid id, [FromBody] ManagerReviewDto dto)
    {
        var identity = GetUserIdentity();
        if (!identity.IsSuccess) return Unauthorized(identity.Error);

        var result = await requestService.ManagerApproveAsync(id, dto, identity.UserId);
        if (!result.Success) return BadRequest(result.Message);

        return Ok(result.Data);
    }

    /// <summary>
    /// POST /api/requests/{id}/manager-reject
    /// Access: Manager. Reject. Body: { note: string } (required).
    /// </summary>
    [HttpPost("{id:guid}/manager-reject")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> ManagerReject(Guid id, [FromBody] ManagerRejectDto dto)
    {
        var identity = GetUserIdentity();
        if (!identity.IsSuccess) return Unauthorized(identity.Error);

        var result = await requestService.ManagerRejectAsync(id, dto, identity.UserId);
        if (!result.Success) return BadRequest(result.Message);

        return Ok(result.Data);
    }

    /// <summary>
    /// POST /api/requests/{id}/finance-approve
    /// Access: Finance. Approve → APPROVED. Body: { purchaseOrderNumber: string, note?: string }.
    /// </summary>
    [HttpPost("{id:guid}/finance-approve")]
    [Authorize(Roles = "Finance")] // 🔒 Restricted to Finance role
    public async Task<IActionResult> FinanceApprove(Guid id, [FromBody] FinanceApproveDto dto)
    {
        var result = await requestService.FinanceApproveAsync(id, dto, CurrentUserId);
        if (!result.Success) return BadRequest(result.Message);

        return Ok(result.Data);
    }

    /// <summary>
    /// POST /api/requests/{id}/finance-reject
    /// Access: Finance. Reject. Body: { note: string } (required).
    /// </summary>
    [HttpPost("{id:guid}/finance-reject")]
    [Authorize(Roles = "Finance")]
    public async Task<IActionResult> FinanceReject(Guid id, [FromBody] FinanceRejectDto dto)
    {
        var result = await requestService.FinanceRejectAsync(id, dto, CurrentUserId);
        if (!result.Success) return BadRequest(result.Message);

        return Ok(result.Data);
    }
}