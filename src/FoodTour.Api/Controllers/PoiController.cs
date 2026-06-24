using Microsoft.AspNetCore.Mvc;
using FoodTour.Api.Models;
using FoodTour.Api.Repositories;
using FoodTour.Api.Services;
namespace FoodTour.Api.Controllers
{
    [ApiController]
    [Route("api/pois")]
    public class PoiController : ControllerBase
    {
        private readonly PoiRepository _repo;
        private readonly TtsManagerService _ttsManager;
        private readonly CloudinaryService _cloudinary;
        
        public PoiController(
            PoiRepository repo, 
            TtsManagerService ttsManager, 
            CloudinaryService cloudinary)
        {
            _repo = repo;
            _ttsManager = ttsManager;
            _cloudinary = cloudinary;
        }

        // ── NEW: GET /pois/owner/list ────────────────────────────────────────────
        // Frontend: menu/page.tsx gọi /pois/owner/list?search=&status=all&page=1&limit=100
        [HttpGet("/pois/owner/list")]
        public async Task<IActionResult> GetOwnerPoisList(
            [FromQuery] string? search = null,
            [FromQuery] string status = "all",
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10)
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false, message = "Authentication required" });

            var allPois = await _repo.GetByOwnerAsync(userId);

            var filtered = status.ToLowerInvariant() switch
            {
                "active" => allPois.Where(p => p.IsActive).ToList(),
                "hidden" => allPois.Where(p => !p.IsActive).ToList(),
                _        => allPois
            };

            if (!string.IsNullOrWhiteSpace(search))
            {
                var q = search.ToLowerInvariant();
                filtered = filtered.Where(p =>
                    (p.Title?.ToLowerInvariant().Contains(q) == true) ||
                    (p.Summary?.ToLowerInvariant().Contains(q) == true) ||
                    (p.Address?.ToLowerInvariant().Contains(q) == true)
                ).ToList();
            }

            var total      = filtered.Count;
            var totalPages = (int)Math.Ceiling(total / (double)limit);
            var data = filtered
                .Skip((page - 1) * limit).Take(limit)
                .Select(p => new
                {
                    p.Id, p.OwnerId, p.Title, p.Summary, p.Address,
                    p.Status, p.IsActive, p.Rating, p.ReviewCount,
                    p.MediaUrls, p.CategoryId,
                    translations = new[] { new { name = p.Title ?? "" } }
                }).ToList();

            return Ok(new
            {
                success = true,
                data = new { data, pagination = new { page, limit, total, totalPages } }
            });
        }
        // ── END NEW ─────────────────────────────────────────────────────────────────

        /// <summary>
        /// Get all approved POIs
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var pois = await _repo.GetAllAsync();
            return Ok(new { success = true, data = pois, total = pois.Count });
        }

        /// <summary>
        /// Get a specific POI by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id, [FromQuery] string? lang = null)
        {
            var poi = await _repo.GetByIdAsync(id);
            if (poi == null)
                return NotFound(new { success = false, message = "POI not found" });
            
            if (!string.IsNullOrEmpty(lang))
            {
                var originalTitle = poi.Title ?? "";
                var originalSummary = poi.Summary ?? "";

                var result = await _ttsManager.ProcessPoiContentAsync(id, originalTitle, originalSummary, lang);
                
                if (!string.IsNullOrEmpty(result.TranslatedTitle))
                    poi.Title = result.TranslatedTitle;
                
                if (!string.IsNullOrEmpty(result.TranslatedText))
                    poi.Summary = result.TranslatedText;
                
                if (!string.IsNullOrEmpty(result.AudioUrl))
                    poi.AudioUrl = result.AudioUrl;
            }

            return Ok(new { success = true, data = poi });
        }

        /// <summary>
        /// Get POIs by category
        /// </summary>
        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetByCategory(string categoryId)
        {
            var pois = await _repo.GetByCategoryAsync(categoryId);
            return Ok(new { success = true, data = pois, total = pois.Count });
        }

        /// <summary>
        /// Get POIs for current user (owner)
        /// </summary>
        [HttpGet("owner/{ownerId}")]
        public async Task<IActionResult> GetByOwner(string ownerId)
        {
            var pois = await _repo.GetByOwnerAsync(ownerId);
            return Ok(new { success = true, data = pois, total = pois.Count });
        }

        /// <summary>
        /// Get POIs pending approval (admin only)
        /// </summary>
        [HttpGet("admin/pending-approval")]
        public async Task<IActionResult> GetPendingApproval()
        {
            var pois = await _repo.GetPendingApprovalAsync();
            return Ok(new { success = true, data = pois, total = pois.Count });
        }

        /// <summary>
        /// Create a new POI
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Poi poi)
        {
            if (string.IsNullOrEmpty(poi.OwnerId))
                return BadRequest(new { success = false, message = "OwnerId is required" });

            var created = await _repo.AddAsync(poi);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, new { success = true, data = created });
        }

        /// <summary>
        /// Update an existing POI
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Poi poi)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { success = false, message = "POI not found" });

            poi.Id = id;
            var updated = await _repo.UpdateAsync(id, poi);

            // Invalidate TTS cache since the text might have changed
            await _ttsManager.InvalidateCacheAsync(id);

            return Ok(new { success = true, data = updated });
        }

        /// <summary>
        /// Partially update a POI
        /// </summary>
        [HttpPatch("{id}")]
        public async Task<IActionResult> PartialUpdate(string id, [FromBody] Dictionary<string, object> updates)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { success = false, message = "POI not found" });

            await _repo.UpdateFieldsAsync(id, updates);
            var updated = await _repo.GetByIdAsync(id);

            // Invalidate TTS cache since the text might have changed
            await _ttsManager.InvalidateCacheAsync(id);

            return Ok(new { success = true, data = updated });
        }

        /// <summary>
        /// Delete a POI
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { success = false, message = "POI not found" });

            await _repo.DeleteAsync(id);
            return Ok(new { success = true, message = "POI deleted successfully" });
        }
        /// <summary>
        /// Upload an image for a POI using Cloudinary
        /// </summary>
        [HttpPost("{id}/image")]
        public async Task<IActionResult> UploadImage(string id, IFormFile file)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { success = false, message = "POI not found" });

            try
            {
                var url = await _cloudinary.UploadImageAsync(file);
                if (string.IsNullOrEmpty(url))
                    return BadRequest(new { success = false, message = "Image upload failed" });

                existing.MediaUrls ??= new List<string>();
                existing.MediaUrls.Add(url);

                var updates = new Dictionary<string, object> { { "mediaUrls", existing.MediaUrls } };
                await _repo.UpdateFieldsAsync(id, updates);

                return Ok(new { success = true, data = new { imageUrl = url } });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
