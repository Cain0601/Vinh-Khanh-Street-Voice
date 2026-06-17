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
        private readonly TranslationService _translation;
        private readonly PiperTtsService _tts;
        private readonly CloudinaryService _cloudinary;
        
        public PoiController(
            PoiRepository repo, 
            TranslationService translation, 
            PiperTtsService tts, 
            CloudinaryService cloudinary)
        {
            _repo = repo;
            _translation = translation;
            _tts = tts;
            _cloudinary = cloudinary;
        }

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
                // Translate the English summary if available, else Vietnamese
                var summaryToTranslate = "";
                if (poi.Summary != null)
                {
                    summaryToTranslate = poi.Summary;
                }

                if (poi.Title != null)
                {
                    var titleToTranslate = poi.Title;
                    var translatedTitle = await _translation.TranslateAsync(titleToTranslate, lang);
                    Console.WriteLine($"[PoiController] Translated Title for lang={lang}: {translatedTitle}");
                    poi.Title = translatedTitle;
                }

                if (!string.IsNullOrEmpty(summaryToTranslate))
                {
                    var translated = await _translation.TranslateAsync(summaryToTranslate, lang);
                    Console.WriteLine($"[PoiController] Translated text for lang={lang}: {translated}");
                    poi.Summary = translated;

                    // Generate TTS
                    var audioData = await _tts.GenerateSpeechAsync(translated, lang);
                    if (audioData != null)
                    {
                        Console.WriteLine($"[PoiController] TTS generated audio for lang={lang}, bytes={audioData.Length}");
                        poi.AudioUrl = $"data:audio/wav;base64,{Convert.ToBase64String(audioData)}";
                    }
                    else
                    {
                        Console.WriteLine($"[PoiController] TTS did not produce audio for lang={lang} (audioData is null)");
                    }

                    // // Persist the translation and audio URLs back to Firestore so subsequent reads include them
                    // try
                    // {
                    //     var updates = new Dictionary<string, object>
                    //     {
                    //         { "summary", poi.Summary },
                    //         { "audioUrls", poi.AudioUrls }
                    //     };
                    //     await _repo.UpdateFieldsAsync(id, updates);
                    //     Console.WriteLine($"[PoiController] Persisted summary and audioUrls for POI {id}.");
                    // }
                    // catch (Exception ex)
                    // {
                    //     Console.WriteLine($"[PoiController] Failed to persist translation/audio for POI {id}: {ex.Message}");
                    // }
                }
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
