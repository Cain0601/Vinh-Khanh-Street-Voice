using Google.Cloud.Firestore;
using FoodTour.Api.Models;

namespace FoodTour.Api.Repositories
{
    public class AuditRepository
    {
        private readonly FirestoreDb _db;
        private const string CollectionName = "audit_logs";

        public AuditRepository(Services.FirestoreService firestoreService)
        {
            _db = firestoreService.DbOrNull!;
        }

        public async Task<List<AuditLog>> GetAllAsync(int? limit = null, int? offset = null)
        {
            Query query = _db.Collection(CollectionName).OrderByDescending("createdAt");
            if (offset.HasValue) query = query.Offset(offset.Value);
            if (limit.HasValue) query = query.Limit(limit.Value);

            var snapshot = await query.GetSnapshotAsync();
            return ConvertSnapshot(snapshot);
        }

        public async Task<int> GetTotalCountAsync()
        {
            var snapshot = await _db.Collection(CollectionName).GetSnapshotAsync();
            return snapshot.Documents.Count;
        }

        public async Task<AuditLog?> GetByIdAsync(string auditLogId)
        {
            var doc = await _db.Collection(CollectionName).Document(auditLogId).GetSnapshotAsync();
            if (!doc.Exists) return null;

            var log = doc.ConvertTo<AuditLog>();
            log.Id = doc.Id;
            return log;
        }

        public async Task<AuditLog> AddAsync(AuditLog auditLog)
        {
            var docRef = _db.Collection(CollectionName).Document();
            auditLog.CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            await docRef.SetAsync(auditLog);
            auditLog.Id = docRef.Id;
            return auditLog;
        }

        public async Task<List<AuditLog>> GetByAdminIdAsync(string adminId)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("adminId", adminId)
                .OrderByDescending("createdAt")
                .GetSnapshotAsync();

            return ConvertSnapshot(snapshot);
        }

        private List<AuditLog> ConvertSnapshot(QuerySnapshot snapshot)
        {
            var list = new List<AuditLog>();
            foreach (var doc in snapshot.Documents)
            {
                var log = doc.ConvertTo<AuditLog>();
                log.Id = doc.Id;
                list.Add(log);
            }
            return list;
        }
    }
}
