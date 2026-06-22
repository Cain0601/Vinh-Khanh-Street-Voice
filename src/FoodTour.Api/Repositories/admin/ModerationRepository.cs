using Google.Cloud.Firestore;
using FoodTour.Api.Models;

namespace FoodTour.Api.Repositories
{
    public class ModerationRepository
    {
        private readonly FirestoreDb _db;
        private const string CollectionName = "moderation_requests";

        public ModerationRepository(Services.FirestoreService firestoreService)
        {
            _db = firestoreService.DbOrNull!;
        }

        public async Task<List<ModerationRequest>> GetAllAsync(string? status = null)
        {
            Query query = _db.Collection(CollectionName).OrderByDescending("createdAt");
            
            var snapshot = await query.GetSnapshotAsync();
            var list = ConvertSnapshot(snapshot);

            if (!string.IsNullOrEmpty(status))
                list = list.Where(m => string.Equals(m.Status, status, StringComparison.OrdinalIgnoreCase)).ToList();

            return list;
        }

        public async Task<ModerationRequest?> GetByIdAsync(string requestId)
        {
            var doc = await _db.Collection(CollectionName).Document(requestId).GetSnapshotAsync();
            if (!doc.Exists) return null;

            var request = doc.ConvertTo<ModerationRequest>();
            request.Id = doc.Id;
            return request;
        }

        public async Task<ModerationRequest> AddAsync(ModerationRequest request)
        {
            var docRef = _db.Collection(CollectionName).Document();
            request.CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            request.UpdatedAt = request.CreatedAt;
            await docRef.SetAsync(request);
            request.Id = docRef.Id;
            return request;
        }

        public async Task<ModerationRequest> UpdateAsync(string requestId, ModerationRequest request)
        {
            request.UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            await _db.Collection(CollectionName).Document(requestId).SetAsync(request, SetOptions.Overwrite);
            request.Id = requestId;
            return request;
        }

        public async Task UpdateStatusAsync(string requestId, string status, string? reason = null)
        {
            var updates = new Dictionary<string, object>
            {
                ["status"] = status,
                ["updatedAt"] = Timestamp.FromDateTime(DateTime.UtcNow)
            };
            if (reason != null) updates["reason"] = reason;
            await _db.Collection(CollectionName).Document(requestId).UpdateAsync(updates);
        }

        private List<ModerationRequest> ConvertSnapshot(QuerySnapshot snapshot)
        {
            var list = new List<ModerationRequest>();
            foreach (var doc in snapshot.Documents)
            {
                var request = doc.ConvertTo<ModerationRequest>();
                request.Id = doc.Id;
                list.Add(request);
            }
            return list;
        }
    }
}
