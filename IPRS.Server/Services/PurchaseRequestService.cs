using IPRS.Server.Common;
using IPRS.Server.DTOs;
using IPRS.Server.Extensions;
using IPRS.Server.Helpers;
using IPRS.Server.Hubs;
using IPRS.Server.Models;
using IPRS.Server.Repositories.Interfaces;
using IPRS.Server.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace IPRS.Server.Services;

public class PurchaseRequestService(
    IPurchaseRequestRepository requestRepo,
    IUserService userService,
    INotificationService notificationService,
    IDepartmentService departmentService,
    IHubContext<NotificationHub> notificationHubContext,
    IHubContext<PurchaseRequestHub> purchaseRequestHubContext
) : IPurchaseRequestService
{
    public async Task<ServiceResult<PurchaseRequestResponseDto>> CreateRequestAsync(CreatePurchaseRequestDto requestDto,
        Guid userId)
    {
        decimal totalPrice = requestDto.Quantity * requestDto.UnitPrice;
        if (totalPrice > 50000 && string.IsNullOrWhiteSpace(requestDto.Description))
        {
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure(
                "A justification description is required for requests exceeding 50,000 SAR.");
        }

        if (!await requestRepo.ExistAsync<Category>(requestDto.CategoryId))
        {
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Category not found.");
        }

        var userDepartmentId = await userService.CheckUserHasDepartmentAsync(userId);

        if (!userDepartmentId.Success)
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure(userDepartmentId.Message);

        int currentYear = DateTime.UtcNow.Year;

        int nextSeq = await requestRepo.GetNextSequenceForYearAsync(currentYear);
        string requestNumber = $"PR-{currentYear}-{nextSeq:D4}";

        var purchaseRequest = requestDto.ToEntity(requestNumber, userId, userDepartmentId.Data);
        if (!purchaseRequest.Success)
        {
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure(purchaseRequest.Message);
        }

        await requestRepo.CreateAsync(purchaseRequest.Data!);
        await requestRepo.SaveChangesAsync();

        var createdRequest = await requestRepo.GetByIdAsync(purchaseRequest.Data!.Id);
        return ServiceResult<PurchaseRequestResponseDto>.LogSuccess(createdRequest!.ToResponse());
    }

    public async Task<ServiceResult<PurchaseRequestResponseDto>> GetRequestByIdAsync(
        Guid id,
        Guid userId,
        string role,
        int? departmentId)
    {
        var request = await requestRepo.GetByIdAsync(id);
        if (request == null)
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Request not found.");

        var userRole = EnumHelper.ConvertStringToEnum<UserRole>(role, "").Data;
        if (userRole == UserRole.Employee && request.RequestedById != userId)
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Request not found.");


        if (userRole == UserRole.Manager && request.DepartmentId != departmentId)
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Request not found.");

        return ServiceResult<PurchaseRequestResponseDto>.LogSuccess(
            request.ToResponse(),
            "Request retrieved successfully."
        );
    }

    public async Task<ServiceResult<ICollection<PurchaseRequestResponseDto>>> GetFilteredRequestsForUserAsync(
        Guid userId, string role, string? status, int? queryDeptId, DateTime? fromDate, DateTime? toDate)
    {
        Guid? filterUserId = null;
        int? filterDeptId = queryDeptId;

        if (role == "Employee")
        {
            filterUserId = userId;
            filterDeptId = null;
        }
        else if (role == "Manager")
        {
            var managerDeptId = await userService.CheckUserHasDepartmentAsync(userId);
            if (!managerDeptId.Success)
            {
                return ServiceResult<ICollection<PurchaseRequestResponseDto>>.LogFailure(
                    "Manager department not found.");
            }

            filterDeptId = managerDeptId.Data;
        }

        PurchaseRequestStatus? parsedStatus = null;

        if (!string.IsNullOrWhiteSpace(status))
        {
            var convertedStatus = EnumHelper.ConvertStringToEnum<PurchaseRequestStatus>(status,
                $"Invalid status code. Valid options are: {string.Join(", ", Enum.GetNames(typeof(PurchaseRequestStatus)))}");

            if (!convertedStatus.Success)
            {
                return ServiceResult<ICollection<PurchaseRequestResponseDto>>.LogFailure(convertedStatus.Message);
            }

            parsedStatus = convertedStatus.Data;
        }

        var results =
            await requestRepo.GetFilteredRequestsAsync(filterUserId, filterDeptId, parsedStatus, fromDate, toDate);
        var responseDtos = results.Select(r => r.ToResponse()).ToList();
        return ServiceResult<ICollection<PurchaseRequestResponseDto>>.LogSuccess(responseDtos);
    }

    public async Task<ServiceResult<PurchaseRequestResponseDto>> EditRequestAsync(Guid id,
        UpdatePurchaseRequestDto requestDto, Guid userId)
    {
        var request = await requestRepo.GetByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Purchase request not found.");
        if (request.RequestedById != userId)
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Access Denied: You do not own this request.");
        if (request.Status != PurchaseRequestStatus.Draft)
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure(
                "Only requests in DRAFT status can be modified.");

        decimal totalPrice = requestDto.Quantity * requestDto.UnitPrice;
        if (totalPrice > 50000 && string.IsNullOrWhiteSpace(requestDto.Description))
        {
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure(
                "A justification description is required for requests exceeding 50,000 SAR.");
        }

        request = request.UpdatePurchaseRequest(requestDto);
        await requestRepo.SaveChangesAsync();
        return ServiceResult<PurchaseRequestResponseDto>.LogSuccess(request.ToResponse());
    }

    public async Task<ServiceResult<PurchaseRequestResponseDto>> SubmitRequestAsync(Guid id, Guid userId)
    {
        var request = await requestRepo.GetByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Purchase request not found.");

        if (request.RequestedById != userId)
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Access Denied.");

        if (request.Status != PurchaseRequestStatus.Draft)
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Only DRAFT requests can be submitted.");

        request.Status = PurchaseRequestStatus.Pending_Manager;
        request.UpdatedAt = DateTime.UtcNow;

        await requestRepo.SaveChangesAsync();
        var department = await departmentService.GetDepartmentByIdAsync(request.DepartmentId);
        if (!department.Success)
        {
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure(department.Message);
        }

        if (department.Data?.ManagerId == null)
        {
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure(
                "Submission blocked: This department has no assigned manager. Please contact an Administrator."
            );
        }

        var notification = await notificationService.CreateNotificationAsync(
            new CreateNotificationDto(
                department.Data.ManagerId.Value,
                $"New procurement request {request.RequestNumber} requires your review.",
                request.Id
            )
        );

        await notificationHubContext.Clients.User(department.Data.ManagerId.Value.ToString())
            .SendAsync("ReceiveNotification", notification.Data);

        await purchaseRequestHubContext.Clients.User(department.Data.ManagerId.Value.ToString())
            .SendAsync("ReceiveRequest", request.ToResponse());

        await requestRepo.SaveChangesAsync();

        return ServiceResult<PurchaseRequestResponseDto>.LogSuccess(request.ToResponse());
    }

    public async Task<ServiceResult<PurchaseRequestResponseDto>> CancelRequestAsync(Guid id, Guid userId)
    {
        var request = await requestRepo.GetByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Purchase request not found.");
        if (request.RequestedById != userId)
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Access Denied.");

        if (request.Status != PurchaseRequestStatus.Draft && request.Status != PurchaseRequestStatus.Pending_Manager)
        {
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure(
                "Requests can only be cancelled during DRAFT or PENDING_MANAGER states.");
        }

        request.Status = PurchaseRequestStatus.Cancelled;
        request.UpdatedAt = DateTime.UtcNow;

        await requestRepo.SaveChangesAsync();

        var notification = await notificationService.CreateNotificationAsync(new CreateNotificationDto
            (
                request.RequestedById,
                $"Your purchase request '{request.Title}' ({request.RequestNumber}) was successfully cancelled.",
                request.Id
            )
        );

        await notificationHubContext.Clients.User(request.RequestedById.ToString())
            .SendAsync("ReceiveNotification", notification.Data);

        await purchaseRequestHubContext.Clients.User(request.RequestedById.ToString())
            .SendAsync("ReceiveRequest", request.ToResponse());
        return ServiceResult<PurchaseRequestResponseDto>.LogSuccess(request.ToResponse());
    }

    public async Task<ServiceResult<PurchaseRequestResponseDto>> ManagerApproveAsync(Guid id, ManagerReviewDto dto,
        Guid managerUserId)
    {
        var request = await requestRepo.GetByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Purchase request not found.");
        if (request.Status != PurchaseRequestStatus.Pending_Manager)
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Request is not waiting for manager review.");

        var deptError = await ValidateAuthorityDepartmentAsync(request.DepartmentId, managerUserId);
        if (!deptError.Success) return ServiceResult<PurchaseRequestResponseDto>.LogFailure(deptError.Message);

        request.ManagerActionById = managerUserId;
        request.ManagerActionAt = DateTime.UtcNow;
        request.Status = PurchaseRequestStatus.Pending_Finance;
        request.ManagerNote = dto.Note;
        request.UpdatedAt = DateTime.UtcNow;

        await requestRepo.SaveChangesAsync();

        var notification = await notificationService.CreateNotificationAsync(new CreateNotificationDto
            (
                request.RequestedById,
                $"Your purchase request '{request.Title}' ({request.RequestNumber}) was approved by your manager and forwarded to Finance.",
                request.Id
            )
        );

        await notificationHubContext.Clients.User(request.RequestedById.ToString())
            .SendAsync("ReceiveNotification", notification.Data);


        var financeUsersResult = await userService.GetAllUsersAsync("Finance", null, true);
        if (financeUsersResult is { Success: true, Data: not null })
        {
            foreach (var financeOfficer in financeUsersResult.Data.Where(u => u.IsActive))
            {
                notification = await notificationService.CreateNotificationAsync(new CreateNotificationDto
                (
                    financeOfficer.Id,
                    $"Request {request.RequestNumber} from Department {request.DepartmentId} has been manager-approved and requires financial clearance.",
                    request.Id
                ));

                await notificationHubContext.Clients.User(financeOfficer.Id.ToString())
                    .SendAsync("ReceiveNotification", notification.Data);

                await purchaseRequestHubContext.Clients.User(financeOfficer.Id.ToString())
                    .SendAsync("ReceiveRequest", request.ToResponse());
            }
        }

        return ServiceResult<PurchaseRequestResponseDto>.LogSuccess(request.ToResponse());
    }

    public async Task<ServiceResult<PurchaseRequestResponseDto>> ManagerRejectAsync(Guid id, ManagerRejectDto dto,
        Guid managerUserId)
    {
        var request = await requestRepo.GetByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Purchase request not found.");
        if (request.Status != PurchaseRequestStatus.Pending_Manager)
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Request is not waiting for manager review.");

        var deptError = await ValidateAuthorityDepartmentAsync(request.DepartmentId, managerUserId);
        if (!deptError.Success) return ServiceResult<PurchaseRequestResponseDto>.LogFailure(deptError.Message);

        request.ManagerActionById = managerUserId;
        request.ManagerActionAt = DateTime.UtcNow;
        request.Status = PurchaseRequestStatus.Rejected;
        request.ManagerNote = dto.Note;
        request.UpdatedAt = DateTime.UtcNow;

        await requestRepo.SaveChangesAsync();

        var notification = await notificationService.CreateNotificationAsync(new CreateNotificationDto
            (
                request.RequestedById,
                $"Your purchase request '{request.Title}' ({request.RequestNumber}) was rejected by your manager. Reason: {dto.Note}",
                request.Id
            )
        );

        await notificationHubContext.Clients.User(managerUserId.ToString())
            .SendAsync("ReceiveNotification", notification.Data);

        await purchaseRequestHubContext.Clients.User(request.RequestedById.ToString())
            .SendAsync("ReceiveRequest", request.ToResponse());

        return ServiceResult<PurchaseRequestResponseDto>.LogSuccess(request.ToResponse());
    }

    public async Task<ServiceResult<PurchaseRequestResponseDto>> FinanceApproveAsync(Guid id, FinanceApproveDto dto,
        Guid financeUserId)
    {
        var request = await requestRepo.GetByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Purchase request not found.");
        if (request.Status != PurchaseRequestStatus.Pending_Finance)
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure(
                "Request is not waiting for final finance review.");

        request.FinanceActionById = financeUserId;
        request.Status = PurchaseRequestStatus.Approved;
        request.FinanceActionAt = DateTime.UtcNow;
        request.PurchaseOrderNumber = dto.PurchaseOrderNumber;
        request.FinanceNote = dto.Note;
        request.UpdatedAt = DateTime.UtcNow;

        await requestRepo.SaveChangesAsync();

        var notification = await notificationService.CreateNotificationAsync(new CreateNotificationDto
            (
                request.RequestedById,
                $"🎉 Your purchase request '{request.Title}' ({request.RequestNumber}) has been fully approved! PO Number: {dto.PurchaseOrderNumber}.",
                request.Id
            )
        );
        await notificationHubContext.Clients.User(financeUserId.ToString())
            .SendAsync("ReceiveNotification", notification.Data);


        await purchaseRequestHubContext.Clients.User(request.RequestedById.ToString())
            .SendAsync("ReceiveRequest", request.ToResponse());

        return ServiceResult<PurchaseRequestResponseDto>.LogSuccess(request.ToResponse());
    }

    public async Task<ServiceResult<PurchaseRequestResponseDto>> FinanceRejectAsync(Guid id, FinanceRejectDto dto,
        Guid financeUserId)
    {
        var request = await requestRepo.GetByIdAsync(id);
        if (request == null) return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Purchase request not found.");
        if (request.Status != PurchaseRequestStatus.Pending_Finance)
            return ServiceResult<PurchaseRequestResponseDto>.LogFailure("Request is not waiting for finance review.");

        request.FinanceActionById = financeUserId;
        request.FinanceActionAt = DateTime.UtcNow;
        request.Status = PurchaseRequestStatus.Rejected;
        request.FinanceNote = dto.Note;
        request.UpdatedAt = DateTime.UtcNow;

        await requestRepo.SaveChangesAsync();

        var notification = await notificationService.CreateNotificationAsync(new CreateNotificationDto
            (
                request.RequestedById,
                $"Your purchase request '{request.Title}' ({request.RequestNumber}) was rejected by Finance. Reason: {dto.Note}",
                request.Id
            )
        );
        await notificationHubContext.Clients.User(request.RequestedById.ToString())
            .SendAsync("ReceiveNotification", notification.Data);

        await purchaseRequestHubContext.Clients.User(request.RequestedById.ToString())
            .SendAsync("ReceiveRequest", request.ToResponse());

        return ServiceResult<PurchaseRequestResponseDto>.LogSuccess(request.ToResponse());
    }

    private async Task<ServiceResult<bool>> ValidateAuthorityDepartmentAsync(int requestDeptId, Guid userId)
    {
        var userDeptId = await userService.CheckUserHasDepartmentAsync(userId);

        if (!userDeptId.Success)
        {
            return ServiceResult<bool>.LogFailure(
                "Access Denied: Manager department identity profile could not be found.");
        }

        if (requestDeptId != userDeptId.Data)
        {
            return ServiceResult<bool>.LogFailure(
                "Access Denied: Managers are only authorized to review purchase requests within their own department.");
        }

        return ServiceResult<bool>.LogSuccess(true);
    }
}