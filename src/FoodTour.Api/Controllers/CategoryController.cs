using Microsoft.AspNetCore.Mvc;
using FoodTour.Api.Models;
using FoodTour.Api.Repositories;

namespace FoodTour.Api.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoryController : ControllerBase
    {
        private readonly CategoryRepository _repo;

        public CategoryController(CategoryRepository repo) => _repo = repo;

        /// <summary>
        /// Get all active categories
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _repo.GetAllAsync();
            return Ok(new { success = true, data = categories, total = categories.Count });
        }

        /// <summary>
        /// Get a specific category by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var category = await _repo.GetByIdAsync(id);
            if (category == null)
                return NotFound(new { success = false, message = "Category not found" });

            return Ok(new { success = true, data = category });
        }

        /// <summary>
        /// Get category by slug
        /// </summary>
        [HttpGet("slug/{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var category = await _repo.GetBySlugAsync(slug);
            if (category == null)
                return NotFound(new { success = false, message = "Category not found" });

            return Ok(new { success = true, data = category });
        }

        /// <summary>
        /// Create a new category (admin only)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Category category)
        {
            if (string.IsNullOrEmpty(category.Slug))
                return BadRequest(new { success = false, message = "Slug is required" });

            var created = await _repo.AddAsync(category);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, new { success = true, data = created });
        }

        /// <summary>
        /// Update a category (admin only)
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Category category)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { success = false, message = "Category not found" });

            category.Id = id;
            var updated = await _repo.UpdateAsync(id, category);
            return Ok(new { success = true, data = updated });
        }

        /// <summary>
        /// Delete a category (admin only)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { success = false, message = "Category not found" });

            await _repo.DeleteAsync(id);
            return Ok(new { success = true, message = "Category deleted successfully" });
        }
    }
}
