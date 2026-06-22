using FoodTour.Api.DTOs;
using FoodTour.Api.Models;
using FoodTour.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace FoodTour.Api.Controllers
{
    [ApiController]
    [Route("analytics")]
    public class AnalyticsController : ControllerBase
    {
        private readonly AnalyticsRepository _analyticsRepo;
        private readonly PoiRepository _poiRepo;

        public AnalyticsController(AnalyticsRepository analyticsRepo, PoiRepository poiRepo)
        {
            _analyticsRepo = analyticsRepo;
            _poiRepo = poiRepo;
        }

        private string? GetUserId()
        {
            var id = HttpContext.Items["UserId"]?.ToString();
            return string.IsNullOrWhiteSpace(id) ? null : id;
        }

        /// <summary>User nghe audio guide của một POI</summary>
        [HttpPost("listen")]
        public async Task<IActionResult> TrackListen([FromBody] AnalyticsEventRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.PoiId))
                return BadRequest(ApiResponse.Fail("PoiId is required"));

            await _analyticsRepo.AddAsync(new AnalyticsEvent
            {
                Type = "LISTEN",
                PoiId = request.PoiId,
                UserId = GetUserId()
            });

            return Ok(ApiResponse.Ok("Listen event recorded"));
        }

        /// <summary>User quét QR tại một POI</summary>
        [HttpPost("qr-scan")]
        public async Task<IActionResult> TrackQrScan([FromBody] AnalyticsEventRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.PoiId))
                return BadRequest(ApiResponse.Fail("PoiId is required"));

            var poi = await _poiRepo.GetByIdAsync(request.PoiId);
            if (poi == null)
                return NotFound(ApiResponse.Fail("POI not found"));

            await _analyticsRepo.AddAsync(new AnalyticsEvent
            {
                Type = "QR_SCAN",
                PoiId = request.PoiId,
                UserId = GetUserId()
            });

            return Ok(ApiResponse.Ok("QR scan recorded"));
        }

        /// <summary>User xem chi tiết một POI</summary>
        [HttpPost("view")]
        public async Task<IActionResult> TrackView([FromBody] AnalyticsEventRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.PoiId))
                return BadRequest(ApiResponse.Fail("PoiId is required"));

            await _analyticsRepo.AddAsync(new AnalyticsEvent
            {
                Type = "VIEW",
                PoiId = request.PoiId,
                UserId = GetUserId()
            });

            return Ok(ApiResponse.Ok("View event recorded"));
        }
    }

    public class AnalyticsEventRequest
    {
        public string PoiId { get; set; } = string.Empty;
    }
}