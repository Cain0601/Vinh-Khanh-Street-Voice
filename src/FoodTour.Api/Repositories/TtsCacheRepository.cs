using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Google.Cloud.Firestore;

namespace FoodTour.Api.Repositories
{
    // Record to store cache entry
    [FirestoreData]
    public class TtsCacheEntry
    {
        [FirestoreProperty("poiId")]
        public string PoiId { get; set; } = string.Empty;

        [FirestoreProperty("lang")]
        public string Lang { get; set; } = string.Empty;

        [FirestoreProperty("translatedTitle")]
        public string TranslatedTitle { get; set; } = string.Empty;

        [FirestoreProperty("translatedText")]
        public string TranslatedText { get; set; } = string.Empty;

        [FirestoreProperty("audioUrl")]
        public string AudioUrl { get; set; } = string.Empty;

        [FirestoreProperty("createdAt")]
        public Timestamp CreatedAt { get; set; }
    }

    public class TtsCacheRepository
    {
        private readonly FirestoreDb? _db;
        private const string CollectionName = "tts_cache";

        public TtsCacheRepository(Services.FirestoreService firestoreService)
        {
            _db = firestoreService.DbOrNull;
        }

        public async Task<TtsCacheEntry?> GetCacheAsync(string poiId, string lang)
        {
            if (_db == null) return null;

            // Document ID can be composite: poiId_lang
            var docId = $"{poiId}_{lang}";
            var doc = await _db.Collection(CollectionName).Document(docId).GetSnapshotAsync();

            if (!doc.Exists)
                return null;

            return doc.ConvertTo<TtsCacheEntry>();
        }

        public async Task SaveCacheAsync(string poiId, string lang, string translatedTitle, string translatedText, string audioUrl)
        {
            if (_db == null) return;

            var docId = $"{poiId}_{lang}";
            var entry = new TtsCacheEntry
            {
                PoiId = poiId,
                Lang = lang,
                TranslatedTitle = translatedTitle,
                TranslatedText = translatedText,
                AudioUrl = audioUrl,
                CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow)
            };

            await _db.Collection(CollectionName).Document(docId).SetAsync(entry);
        }

        public async Task InvalidateCacheForPoiAsync(string poiId)
        {
            if (_db == null) return;

            // Find all cache entries for this poiId and delete them
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("poiId", poiId)
                .GetSnapshotAsync();

            var batch = _db.StartBatch();
            foreach (var doc in snapshot.Documents)
            {
                batch.Delete(doc.Reference);
            }

            if (snapshot.Documents.Count > 0)
            {
                await batch.CommitAsync();
            }
        }
    }
}
