using Microsoft.AspNetCore.Mvc;
using FoodTour.Api.Models;
using FoodTour.Api.Repositories;
using System.Threading.Tasks;

namespace FoodTour.Api.Controllers
{
    [ApiController]
    [Route("api/owner")]
    public class OwnerController : ControllerBase
    {
        private readonly PoiRepository _poiRepo;

        public OwnerController(PoiRepository poiRepo)
        {
            _poiRepo = poiRepo;
        }

        // 1. Lấy danh sách quán của tôi
        [HttpGet("pois")]
        public async Task<IActionResult> GetOwnerPois([FromQuery] string ownerId)
        {
            if (string.IsNullOrEmpty(ownerId)) return BadRequest(new { success = false, message = "OwnerId is required" });
            var pois = await _poiRepo.GetByOwnerAsync(ownerId);
            return Ok(new { success = true, data = pois, total = pois.Count });
        }

        // 2. Tạo quán mới
        [HttpPost("pois")]
        public async Task<IActionResult> CreatePoi([FromBody] Poi poi)
        {
            if (string.IsNullOrEmpty(poi.OwnerId)) return BadRequest(new { success = false, message = "OwnerId is required" });
            poi.Status = "pending"; 
            var created = await _poiRepo.AddAsync(poi);
            return Ok(new { success = true, data = created });
        }

        // 3. Cập nhật thông tin quán (TÍNH NĂNG MỚI ĐÂY!)
        [HttpPut("pois/{id}")]
        public async Task<IActionResult> UpdatePoi(string id, [FromBody] Poi poi)
        {
            var existing = await _poiRepo.GetByIdAsync(id);
            if (existing == null) return NotFound(new { success = false, message = "Không tìm thấy quán này" });

            // Chỉ cho phép cập nhật nếu đúng là chủ sở hữu (Bảo mật cơ bản)
            if (existing.OwnerId != poi.OwnerId) return Forbid();

            var updated = await _poiRepo.UpdateAsync(id, poi);
            return Ok(new { success = true, data = updated, message = "Cập nhật thông tin quán thành công!" });
        }
    }
}