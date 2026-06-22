using Microsoft.AspNetCore.Mvc;
using FoodTour.Api.Models;
using FoodTour.Api.Repositories;

namespace FoodTour.Api.Controllers
{
    [ApiController]
    [Route("api/owner")]
    public class MenuItemController : ControllerBase
    {
        private readonly MenuItemRepository _repo;
        private readonly PoiRepository _poiRepo;

        public MenuItemController(MenuItemRepository repo, PoiRepository poiRepo)
        {
            _repo    = repo;
            _poiRepo = poiRepo;
        }

        // ── NEW: GET /menu-items/owner/list ──────────────────────────────────────
        // Frontend: menu/page.tsx gọi /menu-items/owner/list?search=&page=1&limit=12
        [HttpGet("/menu-items/owner/list")]
        public async Task<IActionResult> GetOwnerMenuItems(
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 12)
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false, message = "Authentication required" });

            var ownerPois = await _poiRepo.GetByOwnerAsync(userId);
            var allItems  = new List<object>();

            foreach (var poi in ownerPois)
            {
                var items = await _repo.GetByPoiIdAsync(poi.Id);
                foreach (var item in items)
                {
                    var nameStr = item.Name.TryGetValue("vi", out var vi) ? vi
                                : item.Name.Values.FirstOrDefault() ?? "";
                    var descStr = item.Description != null
                        ? (item.Description.TryGetValue("vi", out var dvi) ? dvi
                           : item.Description.Values.FirstOrDefault())
                        : null;

                    allItems.Add(new
                    {
                        item.Id,
                        poiId       = item.PoiId,
                        name        = nameStr,
                        price       = item.Price,
                        isAvailable = item.IsActive,
                        description = descStr,
                        imageUrl    = item.MediaUrl,
                        poi = new
                        {
                            id           = poi.Id,
                            translations = new[] { new { name = poi.Title ?? "" } }
                        }
                    });
                }
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var q = search.ToLowerInvariant();
                allItems = allItems
                    .Where(i => {
                        dynamic d = i;
                        string n = d.name; string? desc = d.description;
                        return n.ToLowerInvariant().Contains(q) ||
                               (desc != null && desc.ToLowerInvariant().Contains(q));
                    })
                    .ToList();
            }

            var total      = allItems.Count;
            var totalPages = (int)Math.Ceiling(total / (double)limit);
            var data       = allItems.Skip((page - 1) * limit).Take(limit).ToList();

            return Ok(new
            {
                success = true,
                data = new { data, pagination = new { page, limit, total, totalPages } }
            });
        }

        // ── NEW: POST /pois/{poiId}/menu-items ───────────────────────────────────
        [HttpPost("/pois/{poiId}/menu-items")]
        public async Task<IActionResult> CreateMenuItemForPoi(string poiId, [FromBody] OwnerMenuItemRequest req)
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false, message = "Authentication required" });

            var poi = await _poiRepo.GetByIdAsync(poiId);
            if (poi == null)
                return NotFound(new { success = false, message = "Không tìm thấy POI" });

            if (!string.Equals(poi.OwnerId, userId, System.StringComparison.Ordinal))
                return Forbid();

            var item = new MenuItem
            {
                PoiId       = poiId,
                Price       = req.Price,
                IsActive    = req.IsAvailable,
                MediaUrl    = req.ImageUrl,
                Name        = new Dictionary<string, string> { ["vi"] = req.Name },
                Description = req.Description != null
                              ? new Dictionary<string, string> { ["vi"] = req.Description }
                              : null
            };

            var created = await _repo.AddAsync(item);
            return Ok(new { success = true, data = created, message = "Thêm món ăn thành công!" });
        }

        // ── NEW: PUT /menu-items/{id} ─────────────────────────────────────────────
        [HttpPut("/menu-items/{id}")]
        public async Task<IActionResult> UpdateMenuItemById(string id, [FromBody] OwnerMenuItemRequest req)
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false, message = "Authentication required" });

            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { success = false, message = "Không tìm thấy món ăn" });

            var poi = await _poiRepo.GetByIdAsync(existing.PoiId);
            if (poi == null)
                return NotFound(new { success = false, message = "Không tìm thấy POI" });

            if (!string.Equals(poi.OwnerId, userId, System.StringComparison.Ordinal))
                return Forbid();

            existing.Price    = req.Price;
            existing.IsActive = req.IsAvailable;
            existing.MediaUrl = req.ImageUrl;
            existing.Name     = new Dictionary<string, string> { ["vi"] = req.Name };
            if (req.Description != null)
                existing.Description = new Dictionary<string, string> { ["vi"] = req.Description };

            var updated = await _repo.UpdateAsync(id, existing);
            return Ok(new { success = true, data = updated, message = "Cập nhật thành công!" });
        }

        // ── NEW: DELETE /menu-items/{id} ─────────────────────────────────────────
        [HttpDelete("/menu-items/{id}")]
        public async Task<IActionResult> DeleteMenuItemById(string id)
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false, message = "Authentication required" });

            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { success = false, message = "Không tìm thấy món ăn" });

            var poi = await _poiRepo.GetByIdAsync(existing.PoiId);
            if (poi == null)
                return NotFound(new { success = false, message = "Không tìm thấy POI" });

            if (!string.Equals(poi.OwnerId, userId, System.StringComparison.Ordinal))
                return Forbid();

            await _repo.DeleteAsync(id);
            return Ok(new { success = true, message = "Xóa món ăn thành công!" });
        }




        // ── Legacy endpoints
        [HttpGet("pois/{poiId}/menu-items")]
        public async Task<IActionResult> GetMenuItems(string poiId)
        {
            var list = await _repo.GetByPoiIdAsync(poiId);
            return Ok(new { success = true, data = list, total = list.Count });
        }

        [HttpPost("pois/{poiId}/menu-items")]
        public async Task<IActionResult> CreateMenuItem(string poiId, [FromBody] MenuItem item)
        {
            item.PoiId = poiId;
            var created = await _repo.AddAsync(item);
            return Ok(new { success = true, data = created, message = "Thêm món ăn vào thực đơn thành công!" });
        }
    }

    // ── DTO ──────────────────────────────────────────────────────────────────────
    public class OwnerMenuItemRequest
    {
        public string Name         { get; set; } = "";
        public double Price        { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl    { get; set; }
        public bool IsAvailable    { get; set; } = true;
    }
}