using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using FoodTour.Api.Repositories;
using FoodTour.Api.Services;
using FoodTour.Api.DTOs;
using FoodTour.Api.Models;

namespace FoodTour.Api.Controllers
{
    [ApiController]
    [Route("analytics")]
    public class AnalyticsController : ControllerBase
    {
        private readonly AnalyticsRepository _analyticsRepository;
        private readonly PoiRepository _poiRepository;
        private readonly FirestoreService _firestoreService;
        // private readonly AnalyticsRepository _analyticsRepo;
        // private readonly PoiRepository _poiRepo;

        public AnalyticsController(
            AnalyticsRepository analyticsRepository,
            PoiRepository poiRepository,
            FirestoreService firestoreService)
        {
            _analyticsRepository = analyticsRepository;
            _poiRepository = poiRepository;
            _firestoreService = firestoreService;
        }
        // public AnalyticsController(AnalyticsRepository analyticsRepo, PoiRepository poiRepo)
        // {
        //     _analyticsRepo = analyticsRepo;
        //     _poiRepo = poiRepo;
        // }

        // GET /analytics/qr-stats
        // Returns QR-scan statistics scoped to the authenticated owner's POIs
        [HttpGet("qr-stats")]
        public async Task<IActionResult> GetQrStats()
        {
            var userId = HttpContext.Items["UserId"]?.ToString();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { success = false, message = "Authentication required" });

            if (_firestoreService.DbOrNull == null)
                return StatusCode(503, new
                {
                    success = false,
                    message = "A backend service is unavailable. Check GOOGLE_APPLICATION_CREDENTIALS points to a valid service_account.json.",
                    data = (object?)null
                });

            var ownerPois = await _poiRepository.GetByOwnerAsync(userId);
            var ownerPoiIds = new HashSet<string>(
                ownerPois.Where(p => !string.IsNullOrEmpty(p.Id)).Select(p => p.Id));

            if (ownerPoiIds.Count == 0)
                return Ok(new
                {
                    success = true,
                    data = new { totalScans = 0, bySource = new object[0], byPoi = new object[0] }
                });

            var allQrEvents = await _analyticsRepository.GetByTypeAsync("QR_SCAN");
            var ownerEvents = allQrEvents
                .Where(e => !string.IsNullOrEmpty(e.PoiId) && ownerPoiIds.Contains(e.PoiId))
                .ToList();

            var bySource = ownerEvents
                .GroupBy(e =>
                {
                    if (e.Metadata != null && e.Metadata.TryGetValue("source", out var s) && s != null)
                        return s.ToString() ?? "unknown";
                    return "unknown";
                })
                .Select(g => new { source = g.Key, count = g.Count() })
                .OrderByDescending(x => x.count)
                .ToList();

            var poiNameMap = ownerPois.ToDictionary(p => p.Id ?? "", p => p.Title ?? "");

            var byPoi = ownerEvents
                .GroupBy(e => e.PoiId)
                .Select(g => new
                {
                    poiId   = g.Key,
                    poiName = poiNameMap.ContainsKey(g.Key ?? "") ? poiNameMap[g.Key ?? ""] : "",
                    count   = g.Count()
                })
                .OrderByDescending(x => x.count)
                .ToList();

            return Ok(new
            {
                success = true,
                data = new { totalScans = ownerEvents.Count, bySource, byPoi }
            });
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

            await _analyticsRepository.AddAsync(new AnalyticsEvent
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

            var poi = await _poiRepository.GetByIdAsync(request.PoiId);
            if (poi == null)
                return NotFound(ApiResponse.Fail("POI not found"));

            await _analyticsRepository.AddAsync(new AnalyticsEvent
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

            await _analyticsRepository.AddAsync(new AnalyticsEvent
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