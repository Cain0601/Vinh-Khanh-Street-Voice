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
        private readonly IHubContext<LocationHub> _hubContext;

        public ModerationController(ModerationRepository moderationRepo, IHubContext<LocationHub> hubContext)
        {
            _moderationRepo = moderationRepo;
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

            var moderationRequest = new ModerationRequest
            {
                Type = type,
                TargetId = string.IsNullOrWhiteSpace(request.TargetId) ? userId : request.TargetId.Trim(),
                RequestedBy = userId,
                Status = "PENDING",
                Reason = request.Message
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
    }

    public class CreateModerationRequest
    {
        public string? Type { get; set; }
        public string? TargetId { get; set; }
        public string? Message { get; set; }
    }
}
