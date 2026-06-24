using System;
using System.Threading.Tasks;
using FoodTour.Api.Repositories;

namespace FoodTour.Api.Services
{
    public class TtsManagerService
    {
        private readonly TtsCacheRepository _cacheRepo;
        private readonly TranslationService _translationService;
        private readonly PiperTtsService _ttsService;
        private readonly CloudinaryService _cloudinaryService;

        public TtsManagerService(
            TtsCacheRepository cacheRepo,
            TranslationService translationService,
            PiperTtsService ttsService,
            CloudinaryService cloudinaryService)
        {
            _cacheRepo = cacheRepo;
            _translationService = translationService;
            _ttsService = ttsService;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<(string TranslatedTitle, string TranslatedText, string AudioUrl)> ProcessPoiContentAsync(
            string poiId, string originalTitle, string originalText, string langCode)
        {
            // 1. Check cache
            var cached = await _cacheRepo.GetCacheAsync(poiId, langCode);
            if (cached != null)
            {
                Console.WriteLine($"[TtsManager] Cache hit for Poi={poiId}, Lang={langCode}");
                return (cached.TranslatedTitle, cached.TranslatedText, cached.AudioUrl);
            }

            Console.WriteLine($"[TtsManager] Cache miss for Poi={poiId}, Lang={langCode}. Processing...");

            // 2. Translate text
            string translatedTitle = string.IsNullOrWhiteSpace(originalTitle) ? "" : 
                await _translationService.TranslateAsync(originalTitle, langCode);

            string translatedText = string.IsNullOrWhiteSpace(originalText) ? "" :
                await _translationService.TranslateAsync(originalText, langCode);

            Console.WriteLine($"[TtsManager] Translated text completed");

            // 3. Generate Audio using Piper TTS (only for summary/text)
            string audioUrl = string.Empty;
            if (!string.IsNullOrWhiteSpace(translatedText))
            {
                var audioBytes = await _ttsService.GenerateSpeechAsync(translatedText, langCode);
                if (audioBytes != null && audioBytes.Length > 0)
                {
                    // 4. Upload Audio to Cloudinary
                    var fileName = $"tts_{poiId}_{langCode}.wav";
                    string folder = $"tts/pois/{poiId}";   // Ví dụ này sẽ tạo folder: tts/pois/12345
        
                    var uploadUrl = await _cloudinaryService.UploadAudioAsync(audioBytes, fileName, folder);
                    
                    if (!string.IsNullOrEmpty(uploadUrl))
                    {
                        audioUrl = uploadUrl;
                        Console.WriteLine($"[TtsManager] Uploaded audio to Cloudinary: {audioUrl}");
                    }
                }
            }

            // 5. Save to Cache
            await _cacheRepo.SaveCacheAsync(poiId, langCode, translatedTitle, translatedText, audioUrl);
            Console.WriteLine($"[TtsManager] Cache saved for Poi={poiId}, Lang={langCode}");

            return (translatedTitle, translatedText, audioUrl);
        }

        public async Task InvalidateCacheAsync(string poiId)
        {
            Console.WriteLine($"[TtsManager] Invalidating cache for Poi={poiId}");
            await _cacheRepo.InvalidateCacheForPoiAsync(poiId);
        }
    }
}
