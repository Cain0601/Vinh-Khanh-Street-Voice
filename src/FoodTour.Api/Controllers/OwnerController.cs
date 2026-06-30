using Microsoft.AspNetCore.Mvc;
using FoodTour.Api.Models;
using FoodTour.Api.Repositories;

namespace FoodTour.Api.Controllers
{
    [ApiController]
    [Route("api/owner")]
    public class OwnerController : ControllerBase
    {
        private readonly PoiRepository _poiRepo;
        private readonly MenuItemRepository _menuRepo;
        private readonly UserRepository _userRepo;
        private readonly AnalyticsRepository _analyticsRepo;

        public OwnerController(
            PoiRepository poiRepo,
            MenuItemRepository menuRepo,
            UserRepository userRepo,
            AnalyticsRepository analyticsRepo)
        {
            _poiRepo  = poiRepo;
            _menuRepo = menuRepo;
            _userRepo = userRepo;
            _analyticsRepo = analyticsRepo;
        }

        // ── NEW: GET /owners/dashboard ────────────────────────────────────────────
        [HttpGet("/owners/dashboard")]
        public async Task<IActionResult> GetOwnerDashboard()
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false, message = "Authentication required" });

            var pois       = await _poiRepo.GetByOwnerAsync(userId);
            var activePois = pois.Where(p => p.IsActive).ToList();

            var ownerPoiIds = new HashSet<string>(pois.Where(p => !string.IsNullOrEmpty(p.Id)).Select(p => p.Id));
            var allQrEvents = await _analyticsRepo.GetByTypeAsync("QR_SCAN");
            var totalScans = allQrEvents.Count(e => !string.IsNullOrEmpty(e.PoiId) && ownerPoiIds.Contains(e.PoiId));

            var menuItemCount = 0;
            double totalRating = 0; int ratingCount = 0;
            foreach (var poi in pois)
            {
                var items = await _menuRepo.GetByPoiIdAsync(poi.Id);
                menuItemCount += items.Count;
                if (poi.Rating.HasValue && poi.Rating > 0)
                    { totalRating += poi.Rating.Value; ratingCount++; }
            }

            var avgRating  = ratingCount > 0 ? Math.Round(totalRating / ratingCount, 1) : 0.0;
            var activeRate = pois.Count > 0
                ? Math.Round((double)activePois.Count / pois.Count * 100, 1) : 0.0;

            var chartData = Enumerable.Range(0, 6).Select(i =>
            {
                var d = DateTime.UtcNow.AddMonths(-5 + i);
                return new { name = d.ToString("MMM"), pois = pois.Count, menuItems = menuItemCount };
            }).ToList();

            return Ok(new
            {
                success = true,
                data = new
                {
                    stats = new
                    {
                        totalPois      = pois.Count,
                        activePois     = activePois.Count,
                        totalMenuItems = menuItemCount,
                        totalScans,
                        avgRating,
                        activeRate
                    },
                    chartData
                }
            });
        }

        // ── NEW: GET /owners/analytics ────────────────────────────────────────────
        [HttpGet("/owners/analytics")]
        public async Task<IActionResult> GetOwnerAnalytics()
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false, message = "Authentication required" });

            var pois       = await _poiRepo.GetByOwnerAsync(userId);
            var activePois = pois.Where(p => p.IsActive).ToList();

            var ownerPoiIds = new HashSet<string>(pois.Where(p => !string.IsNullOrEmpty(p.Id)).Select(p => p.Id));
            var allQrEvents = await _analyticsRepo.GetByTypeAsync("QR_SCAN");
            var totalScans = allQrEvents.Count(e => !string.IsNullOrEmpty(e.PoiId) && ownerPoiIds.Contains(e.PoiId));

            var menuItemCount = 0;
            double totalRating = 0; int ratingCount = 0;
            var distribution  = new List<object>();

            foreach (var poi in pois)
            {
                var items = await _menuRepo.GetByPoiIdAsync(poi.Id);
                menuItemCount += items.Count;
                if (poi.Rating.HasValue && poi.Rating > 0)
                    { totalRating += poi.Rating.Value; ratingCount++; }
                if (items.Count > 0)
                    distribution.Add(new { name = poi.Title ?? "POI", value = items.Count });
            }

            var avgRating  = ratingCount > 0 ? Math.Round(totalRating / ratingCount, 1) : 0.0;
            var activeRate = pois.Count > 0
                ? Math.Round((double)activePois.Count / pois.Count * 100, 1) : 0.0;
            var chartData  = Enumerable.Range(0, 6).Select(i =>
            {
                var d = DateTime.UtcNow.AddMonths(-5 + i);
                return new { name = d.ToString("MMM"), pois = pois.Count, menuItems = menuItemCount };
            }).ToList();

            return Ok(new
            {
                success = true,
                data = new
                {
                    stats = new
                    {
                        totalPois = pois.Count, activePois = activePois.Count,
                        totalMenuItems = menuItemCount, totalScans, avgRating, activeRate
                    },
                    chartData,
                    distribution
                }
            });
        }

        // ── NEW: Owner Profile & Settings ─────────────────────────────────────────

        // GET /owner/profile
        [HttpGet("profile")]
        public async Task<IActionResult> GetOwnerProfile()
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false, message = "Authentication required" });

            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return NotFound(new { success = false, message = "Owner profile not found" });

            return Ok(new
            {
                success = true,
                data = new
                {
                    email = user.Email,
                    fullName = user.FullName,
                    phoneNumber = user.PhoneNumber,
                    avatar = user.Avatar,
                    brandName = user.BrandName
                }
            });
        }

        // PUT /owner/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateOwnerProfile([FromBody] UpdateOwnerProfileRequest req)
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false, message = "Authentication required" });

            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return NotFound(new { success = false, message = "Owner profile not found" });

            var updates = new Dictionary<string, object>();

            if (!string.IsNullOrWhiteSpace(req.FullName))
            {
                user.FullName = req.FullName.Trim();
                updates["fullName"] = user.FullName;
            }

            if (req.PhoneNumber != null)
            {
                user.PhoneNumber = req.PhoneNumber.Trim();
                updates["phoneNumber"] = user.PhoneNumber;
            }

            if (req.Avatar != null)
            {
                user.Avatar = string.IsNullOrWhiteSpace(req.Avatar) ? null : req.Avatar.Trim();
                updates["avatar"] = user.Avatar;
            }

            if (req.BrandName != null)
            {
                user.BrandName = string.IsNullOrWhiteSpace(req.BrandName) ? null : req.BrandName.Trim();
                updates["brandName"] = user.BrandName;
            }

            if (updates.Count == 0)
                return BadRequest(new { success = false, message = "No profile fields were provided" });

            await _userRepo.UpdateFieldsAsync(userId, updates);

            return Ok(new
            {
                success = true,
                data = new
                {
                    email = user.Email,
                    fullName = user.FullName,
                    phoneNumber = user.PhoneNumber,
                    avatar = user.Avatar,
                    brandName = user.BrandName
                },
                message = "Profile updated"
            });
        }

        // GET /owner/settings
        [HttpGet("settings")]
        public async Task<IActionResult> GetOwnerSettings()
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false, message = "Authentication required" });

            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return NotFound(new { success = false, message = "Owner settings not found" });

            var notificationsEmail = user.Preferences?.Notifications?.Email ?? true;
            var poiDefaultIsActive = user.Preferences?.PoiDefaultIsActive ?? true;

            return Ok(new
            {
                success = true,
                data = new
                {
                    notificationsEmail,
                    poiDefaultIsActive
                }
            });
        }

        // PUT /owner/settings
        [HttpPut("settings")]
        public async Task<IActionResult> UpdateOwnerSettings([FromBody] UpdateOwnerSettingsRequest req)
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false, message = "Authentication required" });

            var user = await _userRepo.GetByIdAsync(userId);
            if (user == null)
                return NotFound(new { success = false, message = "Owner settings not found" });

            var updates = new Dictionary<string, object>();

            if (req.NotificationsEmail.HasValue)
            {
                var v = req.NotificationsEmail.Value;
                user.Preferences ??= new User.UserPreferences();
                user.Preferences.Notifications ??= new User.NotificationsPreference();
                user.Preferences.Notifications.Email = v;
                updates["preferences.notifications.email"] = v;
            }

            if (req.PoiDefaultIsActive.HasValue)
            {
                var v = req.PoiDefaultIsActive.Value;
                user.Preferences ??= new User.UserPreferences();
                user.Preferences.PoiDefaultIsActive = v;
                updates["preferences.poiDefaultIsActive"] = v;
            }

            if (updates.Count == 0)
                return BadRequest(new { success = false, message = "No settings fields were provided" });

            await _userRepo.UpdateFieldsAsync(userId, updates);

            return Ok(new
            {
                success = true,
                data = new
                {
                    notificationsEmail = req.NotificationsEmail ?? (user.Preferences?.Notifications?.Email ?? true),
                    poiDefaultIsActive = req.PoiDefaultIsActive ?? (user.Preferences?.PoiDefaultIsActive ?? true)
                },
                message = "Settings updated"
            });
        }

        // ── Legacy endpoints (giữ nguyên) ─────────────────────────────────────────
        [HttpGet("pois")]
        public async Task<IActionResult> GetOwnerPois([FromQuery] string ownerId)
        {
            if (string.IsNullOrEmpty(ownerId)) return BadRequest(new { success = false, message = "OwnerId is required" });
            var pois = await _poiRepo.GetByOwnerAsync(ownerId);
            return Ok(new { success = true, data = pois, total = pois.Count });
        }

        [HttpPost("pois")]
        public async Task<IActionResult> CreatePoi([FromBody] Poi poi)
        {
            if (string.IsNullOrEmpty(poi.OwnerId)) return BadRequest(new { success = false, message = "OwnerId is required" });
            poi.Status = "pending";
            var created = await _poiRepo.AddAsync(poi);
            return Ok(new { success = true, data = created });
        }

        [HttpPut("pois/{id}")]
        public async Task<IActionResult> UpdatePoi(string id, [FromBody] Poi poi)
        {
            var existing = await _poiRepo.GetByIdAsync(id);
            if (existing == null) return NotFound(new { success = false, message = "Không tìm thấy quán này" });
            if (existing.OwnerId != poi.OwnerId) return Forbid();
            var updated = await _poiRepo.UpdateAsync(id, poi);
            return Ok(new { success = true, data = updated, message = "Cập nhật thành công!" });
        }
    }

    public class UpdateOwnerProfileRequest
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Avatar { get; set; }
        public string? BrandName { get; set; }
    }

    public class UpdateOwnerSettingsRequest
    {
        public bool? NotificationsEmail { get; set; }
        public bool? PoiDefaultIsActive { get; set; }
    }
}
