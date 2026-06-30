using FoodTour.Api.DTOs;
using FoodTour.Api.Models;
using FoodTour.Api.Repositories;
using FoodTour.Api.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace FoodTour.Api.Controllers
{
    [ApiController]
    [Route("moderation")]
    public class ModerationController : ControllerBase
    {
        private readonly ModerationRepository _moderationRepo;
        private readonly UserRepository _userRepo;
        private readonly IHubContext<LocationHub> _hubContext;

        public ModerationController(
            ModerationRepository moderationRepo,
            UserRepository userRepo,
            IHubContext<LocationHub> hubContext)
        {
            _moderationRepo = moderationRepo;
            _userRepo = userRepo;
            _hubContext = hubContext;
        }

        [HttpPost("requests")]
        public async Task<IActionResult> CreateRequest([FromBody] CreateModerationRequest request)
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(ApiResponse.Fail("User is not authenticated"));

            var type = string.IsNullOrWhiteSpace(request.Type) ? "UPGRADE_OWNER" : request.Type.Trim().ToUpperInvariant();
            var allowedTypes = new[] { "UPGRADE_OWNER", "POI_CREATE", "POI_UPDATE" };
            if (!allowedTypes.Contains(type))
                return BadRequest(ApiResponse.Fail("Invalid moderation request type"));

            if (type == "UPGRADE_OWNER" && await _moderationRepo.HasPendingAsync(userId, type))
                return BadRequest(ApiResponse.Fail("You already have a pending owner upgrade request"));

            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return NotFound(ApiResponse.Fail("User not found"));

            var ownerFullName = string.IsNullOrWhiteSpace(request.OwnerFullName)
                ? user.FullName
                : request.OwnerFullName.Trim();
            var ownerPhoneNumber = string.IsNullOrWhiteSpace(request.OwnerPhoneNumber)
                ? user.PhoneNumber
                : request.OwnerPhoneNumber.Trim();
            var ownerAvatar = string.IsNullOrWhiteSpace(request.OwnerAvatar)
                ? user.Avatar
                : request.OwnerAvatar.Trim();
            var ownerBrandName = string.IsNullOrWhiteSpace(request.OwnerBrandName)
                ? user.BrandName
                : request.OwnerBrandName.Trim();

            if (type == "UPGRADE_OWNER" && string.IsNullOrWhiteSpace(ownerFullName))
                return BadRequest(ApiResponse.Fail("Owner full name is required"));

            var moderationRequest = new ModerationRequest
            {
                Type = type,
                TargetId = string.IsNullOrWhiteSpace(request.TargetId) ? userId : request.TargetId.Trim(),
                RequestedBy = userId,
                Status = "PENDING",
                Reason = request.Message?.Trim(),
                OwnerFullName = ownerFullName,
                OwnerPhoneNumber = ownerPhoneNumber,
                OwnerAvatar = ownerAvatar,
                OwnerBrandName = ownerBrandName
            };

            var created = await _moderationRepo.AddAsync(moderationRequest);

            // Notify all admins in real-time
            await _hubContext.Clients.Group("Admins").SendAsync("NewModerationRequest", new
            {
                id = created.Id,
                type = created.Type,
                requestedBy = created.RequestedBy,
                targetId = created.TargetId
            });

            return Ok(ApiResponse.Ok(created, "Moderation request created"));
        }

        [HttpGet("requests/me")]
        public async Task<IActionResult> GetMyRequest([FromQuery] string? type = null)
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(ApiResponse.Fail("User is not authenticated"));

            var normalizedType = string.IsNullOrWhiteSpace(type) ? null : type.Trim().ToUpperInvariant();
            var request = await _moderationRepo.GetLatestAsync(userId, normalizedType, "PENDING");
            return Ok(ApiResponse.Ok(request));
        }
    }

    public class CreateModerationRequest
    {
        public string? Type { get; set; }
        public string? TargetId { get; set; }
        public string? Message { get; set; }
        public string? OwnerFullName { get; set; }
        public string? OwnerPhoneNumber { get; set; }
        public string? OwnerAvatar { get; set; }
        public string? OwnerBrandName { get; set; }
    }
}
