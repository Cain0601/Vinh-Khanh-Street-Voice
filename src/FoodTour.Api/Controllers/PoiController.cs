using Microsoft.AspNetCore.Mvc;
using FoodTour.Api.Models;
using FoodTour.Api.Repositories;

namespace FoodTour.Api.Controllers
{
    [ApiController]
    [Route("api/pois")]
    public class PoiController : ControllerBase
    {
        private readonly PoiRepository _repo;
        
        public PoiController(PoiRepository repo) => _repo = repo;

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
        public async Task<IActionResult> GetById(string id)
        {
            var poi = await _repo.GetByIdAsync(id);
            if (poi == null)
                return NotFound(new { success = false, message = "POI not found" });
            
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
    }
}
