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

        /// <summary>
        /// GET /api/owner/pois?ownerId={ownerId}
        /// </summary>
        [HttpGet("pois")]
        public async Task<IActionResult> GetOwnerPois([FromQuery] string ownerId)
        {
            if (string.IsNullOrEmpty(ownerId))
            {
                return BadRequest(new { success = false, message = "OwnerId is required" });
            }

            var pois = await _poiRepo.GetByOwnerAsync(ownerId);
            return Ok(new { success = true, data = pois, total = pois.Count });
        }

        /// <summary>
        /// POST /api/owner/pois
        /// </summary>
        [HttpPost("pois")]
        public async Task<IActionResult> CreatePoi([FromBody] Poi poi)
        {
            if (string.IsNullOrEmpty(poi.OwnerId))
            {
                return BadRequest(new { success = false, message = "OwnerId is required" });
            }

            poi.Status = "pending"; 
            var created = await _poiRepo.AddAsync(poi);
            return Ok(new { success = true, data = created });
        }
    }
}