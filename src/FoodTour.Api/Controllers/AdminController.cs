using Microsoft.AspNetCore.Mvc;
using FoodTour.Api.DTOs;
using FoodTour.Api.Models;
using FoodTour.Api.Repositories;
using System.Text.Json;

namespace FoodTour.Api.Controllers
{
    /// <summary>
    /// Admin portal endpoints — user management, moderation, categories, audit, analytics
    /// </summary>
    [ApiController]
    [Route("admin")]
    public class AdminController : ControllerBase
    {
        private readonly UserRepository _userRepo;
        private readonly CategoryRepository _categoryRepo;
        private readonly ModerationRepository _moderationRepo;
        private readonly AuditRepository _auditRepo;
        private readonly AnalyticsRepository _analyticsRepo;
        private readonly PoiRepository _poiRepo;

        public AdminController(
            UserRepository userRepo,
            CategoryRepository categoryRepo,
            ModerationRepository moderationRepo,
            AuditRepository auditRepo,
            AnalyticsRepository analyticsRepo,
            PoiRepository poiRepo)
        {
            _userRepo = userRepo;
            _categoryRepo = categoryRepo;
            _moderationRepo = moderationRepo;
            _auditRepo = auditRepo;
            _analyticsRepo = analyticsRepo;
            _poiRepo = poiRepo;
        }

        private string GetAdminId() => HttpContext.Items["UserId"]?.ToString() ?? "";

        // ──────────────────── USER MANAGEMENT ────────────────────

        /// <summary>
        /// List all users
        /// </summary>
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var total = await _userRepo.GetTotalCountAsync();
            var offset = (page - 1) * pageSize;
            var users = await _userRepo.GetAllAsync(limit: pageSize, offset: offset);

            return Ok(new PaginatedResponse<User>
            {
                Data = users,
                Total = total,
                Page = page,
                PageSize = pageSize
            });
        }

        /// <summary>
        /// Get user detail
        /// </summary>
        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound(ApiResponse.Fail("User not found"));

            return Ok(ApiResponse.Ok(user));
        }

        /// <summary>
        /// Change user role
        /// </summary>
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> ChangeUserRole(string id, [FromBody] ChangeRoleRequest request)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound(ApiResponse.Fail("User not found"));

            var validRoles = new[] { "USER", "OWNER", "ADMIN" };
            if (!validRoles.Contains(request.Role))
                return BadRequest(ApiResponse.Fail("Invalid role. Must be USER, OWNER, or ADMIN"));

            var oldRole = user.Role;
            user.Role = request.Role;
            await _userRepo.UpdateAsync(id, user);

            // Create audit log
            await _auditRepo.AddAsync(new AuditLog
            {
                AdminId = GetAdminId(),
                Action = "CHANGE_ROLE",
                TargetId = id,
                OldValue = JsonSerializer.Serialize(new { role = oldRole }),
                NewValue = JsonSerializer.Serialize(new { role = request.Role }),
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = HttpContext.Request.Headers["User-Agent"].FirstOrDefault()
            });

            return Ok(ApiResponse.Ok(user, $"Role changed from {oldRole} to {request.Role}"));
        }

        /// <summary>
        /// Lock/unlock user
        /// </summary>
        [HttpPut("users/{id}/status")]
        public async Task<IActionResult> ChangeUserStatus(string id, [FromBody] ChangeStatusRequest request)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound(ApiResponse.Fail("User not found"));

            var oldStatus = user.IsActive;
            user.IsActive = request.IsActive;
            await _userRepo.UpdateAsync(id, user);

            // Create audit log
            await _auditRepo.AddAsync(new AuditLog
            {
                AdminId = GetAdminId(),
                Action = request.IsActive ? "UNLOCK_USER" : "LOCK_USER",
                TargetId = id,
                OldValue = JsonSerializer.Serialize(new { isActive = oldStatus }),
                NewValue = JsonSerializer.Serialize(new { isActive = request.IsActive }),
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = HttpContext.Request.Headers["User-Agent"].FirstOrDefault()
            });

            return Ok(ApiResponse.Ok(user, request.IsActive ? "User unlocked" : "User locked"));
        }

        /// <summary>
        /// Soft delete user
        /// </summary>
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null)
                return NotFound(ApiResponse.Fail("User not found"));

            await _userRepo.SoftDeleteAsync(id);

            await _auditRepo.AddAsync(new AuditLog
            {
                AdminId = GetAdminId(),
                Action = "DELETE_USER",
                TargetId = id,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = HttpContext.Request.Headers["User-Agent"].FirstOrDefault()
            });

            return Ok(ApiResponse.Ok("User deleted"));
        }

        // ──────────────────── MODERATION ────────────────────

        /// <summary>
        /// List moderation requests
        /// </summary>
        [HttpGet("moderation/requests")]
        public async Task<IActionResult> GetModerationRequests([FromQuery] string? status = null)
        {
            var requests = await _moderationRepo.GetAllAsync(status);
            return Ok(ApiResponse.Ok(new { items = requests, total = requests.Count }));
        }

        /// <summary>
        /// Get moderation request detail
        /// </summary>
        [HttpGet("moderation/requests/{id}")]
        public async Task<IActionResult> GetModerationRequest(string id)
        {
            var request = await _moderationRepo.GetByIdAsync(id);
            if (request == null)
                return NotFound(ApiResponse.Fail("Moderation request not found"));

            return Ok(ApiResponse.Ok(request));
        }

        /// <summary>
        /// Approve a moderation request
        /// </summary>
        [HttpPost("moderation/requests/{id}/approve")]
        public async Task<IActionResult> ApproveModerationRequest(string id)
        {
            var request = await _moderationRepo.GetByIdAsync(id);
            if (request == null)
                return NotFound(ApiResponse.Fail("Moderation request not found"));

            if (request.Status != "PENDING")
                return BadRequest(ApiResponse.Fail("Request is not pending"));

            await _moderationRepo.UpdateStatusAsync(id, "APPROVED");

            // If it's a POI approval, update the POI status
            if (request.Type == "POI_CREATE" || request.Type == "POI_UPDATE")
            {
                var poi = await _poiRepo.GetByIdAsync(request.TargetId);
                if (poi != null)
                {
                    await _poiRepo.UpdateFieldsAsync(request.TargetId, new Dictionary<string, object>
                    {
                        ["status"] = "approved"
                    });
                }
            }

            // If it's a role upgrade, update the user role
            if (request.Type == "UPGRADE_OWNER")
            {
                var user = await _userRepo.GetByIdAsync(request.RequestedBy);
                if (user != null)
                {
                    user.Role = "OWNER";
                    await _userRepo.UpdateAsync(request.RequestedBy, user);
                }
            }

            await _auditRepo.AddAsync(new AuditLog
            {
                AdminId = GetAdminId(),
                Action = "APPROVE_MODERATION",
                TargetId = id,
                NewValue = JsonSerializer.Serialize(new { status = "APPROVED" }),
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = HttpContext.Request.Headers["User-Agent"].FirstOrDefault()
            });

            return Ok(ApiResponse.Ok("Request approved"));
        }

        /// <summary>
        /// Reject a moderation request
        /// </summary>
        [HttpPost("moderation/requests/{id}/reject")]
        public async Task<IActionResult> RejectModerationRequest(string id, [FromBody] RejectRequest? body = null)
        {
            var request = await _moderationRepo.GetByIdAsync(id);
            if (request == null)
                return NotFound(ApiResponse.Fail("Moderation request not found"));

            if (request.Status != "PENDING")
                return BadRequest(ApiResponse.Fail("Request is not pending"));

            await _moderationRepo.UpdateStatusAsync(id, "REJECTED", body?.Reason);

            // If it's a POI, update status to rejected
            if (request.Type == "POI_CREATE" || request.Type == "POI_UPDATE")
            {
                var poi = await _poiRepo.GetByIdAsync(request.TargetId);
                if (poi != null)
                {
                    await _poiRepo.UpdateFieldsAsync(request.TargetId, new Dictionary<string, object>
                    {
                        ["status"] = "rejected"
                    });
                }
            }

            await _auditRepo.AddAsync(new AuditLog
            {
                AdminId = GetAdminId(),
                Action = "REJECT_MODERATION",
                TargetId = id,
                NewValue = JsonSerializer.Serialize(new { status = "REJECTED", reason = body?.Reason }),
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = HttpContext.Request.Headers["User-Agent"].FirstOrDefault()
            });

            return Ok(ApiResponse.Ok("Request rejected"));
        }

        // ──────────────────── CATEGORY MANAGEMENT ────────────────────

        /// <summary>
        /// Create a category (admin)
        /// </summary>
        [HttpPost("categories")]
        public async Task<IActionResult> CreateCategory([FromBody] Category category)
        {
            if (string.IsNullOrEmpty(category.Slug))
                return BadRequest(ApiResponse.Fail("Slug is required"));

            var created = await _categoryRepo.AddAsync(category);

            await _auditRepo.AddAsync(new AuditLog
            {
                AdminId = GetAdminId(),
                Action = "CREATE_CATEGORY",
                TargetId = created.Id,
                NewValue = JsonSerializer.Serialize(new { name = category.Name, slug = category.Slug }),
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = HttpContext.Request.Headers["User-Agent"].FirstOrDefault()
            });

            return CreatedAtAction(null, null, ApiResponse.Ok(created, "Category created"));
        }

        /// <summary>
        /// Update a category (admin)
        /// </summary>
        [HttpPut("categories/{id}")]
        public async Task<IActionResult> UpdateCategory(string id, [FromBody] Category category)
        {
            var existing = await _categoryRepo.GetByIdAsync(id);
            if (existing == null)
                return NotFound(ApiResponse.Fail("Category not found"));

            category.Id = id;
            var updated = await _categoryRepo.UpdateAsync(id, category);
            return Ok(ApiResponse.Ok(updated, "Category updated"));
        }

        /// <summary>
        /// Delete a category (admin)
        /// </summary>
        [HttpDelete("categories/{id}")]
        public async Task<IActionResult> DeleteCategory(string id)
        {
            var existing = await _categoryRepo.GetByIdAsync(id);
            if (existing == null)
                return NotFound(ApiResponse.Fail("Category not found"));

            await _categoryRepo.DeleteAsync(id);

            await _auditRepo.AddAsync(new AuditLog
            {
                AdminId = GetAdminId(),
                Action = "DELETE_CATEGORY",
                TargetId = id,
                IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = HttpContext.Request.Headers["User-Agent"].FirstOrDefault()
            });

            return Ok(ApiResponse.Ok("Category deleted"));
        }

        // ──────────────────── AUDIT LOGS ────────────────────

        /// <summary>
        /// Get audit logs with pagination
        /// </summary>
        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var total = await _auditRepo.GetTotalCountAsync();
            var offset = (page - 1) * pageSize;
            var logs = await _auditRepo.GetAllAsync(limit: pageSize, offset: offset);

            return Ok(new PaginatedResponse<AuditLog>
            {
                Data = logs,
                Total = total,
                Page = page,
                PageSize = pageSize
            });
        }

        // ──────────────────── ANALYTICS ────────────────────

        /// <summary>
        /// Get system-wide analytics summary
        /// </summary>
        [HttpGet("analytics/summary")]
        public async Task<IActionResult> GetAnalyticsSummary()
        {
            var totalUsers = await _userRepo.GetTotalCountAsync();
            var totalListens = await _analyticsRepo.GetCountByTypeAsync("LISTEN");
            var totalScans = await _analyticsRepo.GetCountByTypeAsync("QR_SCAN");
            var totalViews = await _analyticsRepo.GetCountByTypeAsync("VIEW");

            return Ok(ApiResponse.Ok(new
            {
                totalUsers,
                totalListens,
                totalScans,
                totalViews
            }));
        }

        /// <summary>
        /// Get top POIs by analytics events
        /// </summary>
        [HttpGet("analytics/top-pois")]
        public async Task<IActionResult> GetTopPois()
        {
            var listenCounts = await _analyticsRepo.GetEventCountsByPoiAsync("LISTEN");
            var scanCounts = await _analyticsRepo.GetEventCountsByPoiAsync("QR_SCAN");

            // Merge and sort
            var allPoiIds = listenCounts.Keys.Union(scanCounts.Keys).Distinct();
            var topPois = allPoiIds.Select(poiId => new
            {
                poiId,
                listens = listenCounts.GetValueOrDefault(poiId, 0),
                scans = scanCounts.GetValueOrDefault(poiId, 0),
                total = listenCounts.GetValueOrDefault(poiId, 0) + scanCounts.GetValueOrDefault(poiId, 0)
            })
            .OrderByDescending(x => x.total)
            .Take(10)
            .ToList();

            return Ok(ApiResponse.Ok(topPois));
        }

        /// <summary>
        /// Get heatmap data
        /// </summary>
        [HttpGet("analytics/heatmap")]
        public async Task<IActionResult> GetHeatmap()
        {
            // Return location-based analytics events
            var events = await _analyticsRepo.GetByTypeAsync("LOCATION", limit: 500);
            return Ok(ApiResponse.Ok(events));
        }
    }

    // Request DTOs for Admin
    public class ChangeRoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }

    public class ChangeStatusRequest
    {
        public bool IsActive { get; set; }
    }

    public class RejectRequest
    {
        public string? Reason { get; set; }
    }
}
