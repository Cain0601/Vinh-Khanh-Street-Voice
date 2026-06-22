using Google.Cloud.Firestore;
using FoodTour.Api.Models;

namespace FoodTour.Api.Repositories
{
    public class AnalyticsRepository
    {
        private readonly FirestoreDb _db;
        private const string CollectionName = "analytics_events";

        public AnalyticsRepository(Services.FirestoreService firestoreService)
        {
            _db = firestoreService.DbOrNull!;
        }

        public async Task<AnalyticsEvent> AddAsync(AnalyticsEvent analyticsEvent)
        {
            var docRef = _db.Collection(CollectionName).Document();
            analyticsEvent.CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            await docRef.SetAsync(analyticsEvent);
            analyticsEvent.Id = docRef.Id;
            return analyticsEvent;
        }

        public async Task<List<AnalyticsEvent>> GetByPoiIdAsync(string poiId, string? type = null)
        {
            Query query = _db.Collection(CollectionName).WhereEqualTo("poiId", poiId);
            if (!string.IsNullOrEmpty(type))
                query = query.WhereEqualTo("type", type);
            query = query.OrderByDescending("createdAt");

            var snapshot = await query.GetSnapshotAsync();
            return ConvertSnapshot(snapshot);
        }

        public async Task<List<AnalyticsEvent>> GetByTypeAsync(string type, int? limit = null)
        {
            Query query = _db.Collection(CollectionName)
                .WhereEqualTo("type", type)
                .OrderByDescending("createdAt");

            if (limit.HasValue) query = query.Limit(limit.Value);

            var snapshot = await query.GetSnapshotAsync();
            return ConvertSnapshot(snapshot);
        }

        public async Task<List<AnalyticsEvent>> GetAllAsync(int? limit = null)
        {
            Query query = _db.Collection(CollectionName).OrderByDescending("createdAt");
            if (limit.HasValue) query = query.Limit(limit.Value);

            var snapshot = await query.GetSnapshotAsync();
            return ConvertSnapshot(snapshot);
        }

        /// <summary>
        /// Get event counts grouped by POI (for top POIs analytics)
        /// </summary>
        public async Task<Dictionary<string, int>> GetEventCountsByPoiAsync(string type)
        {
            var events = await GetByTypeAsync(type);
            return events.GroupBy(e => e.PoiId)
                         .ToDictionary(g => g.Key, g => g.Count());
        }

        /// <summary>
        /// Get total event count by type
        /// </summary>
        public async Task<int> GetCountByTypeAsync(string type)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("type", type)
                .GetSnapshotAsync();
            return snapshot.Documents.Count;
        }

        private List<AnalyticsEvent> ConvertSnapshot(QuerySnapshot snapshot)
        {
            var list = new List<AnalyticsEvent>();
            foreach (var doc in snapshot.Documents)
            {
                var evt = doc.ConvertTo<AnalyticsEvent>();
                evt.Id = doc.Id;
                list.Add(evt);
            }
            return list;
        }
    }
}
