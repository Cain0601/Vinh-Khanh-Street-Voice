using Google.Cloud.Firestore;
using FoodTour.Api.Models;

namespace FoodTour.Api.Repositories
{
    public class UserRepository
    {
        private readonly FirestoreDb _db;
        private const string CollectionName = "users";

        public UserRepository(Services.FirestoreService firestoreService)
        {
            _db = firestoreService.Db;
        }

        public async Task<List<User>> GetAllAsync(int? limit = null, int? offset = null)
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

        public async Task<User?> GetByIdAsync(string userId)
        {
            var doc = await _db.Collection(CollectionName).Document(userId).GetSnapshotAsync();
            if (!doc.Exists) return null;

            var user = doc.ConvertTo<User>();
            user.Id = doc.Id;
            return user;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("email", email)
                .Limit(1)
                .GetSnapshotAsync();

            if (snapshot.Documents.Count == 0) return null;

            var doc = snapshot.Documents[0];
            var user = doc.ConvertTo<User>();
            user.Id = doc.Id;
            return user;
        }

        public async Task<User> AddAsync(User user)
        {
            var docRef = _db.Collection(CollectionName).Document();
            user.CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            user.UpdatedAt = user.CreatedAt;
            await docRef.SetAsync(user);
            user.Id = docRef.Id;
            return user;
        }

        public async Task<User> UpdateAsync(string userId, User user)
        {
            user.UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            await _db.Collection(CollectionName).Document(userId).SetAsync(user, SetOptions.Overwrite);
            user.Id = userId;
            return user;
        }

        public async Task UpdateFieldsAsync(string userId, Dictionary<string, object> fields)
        {
            fields["updatedAt"] = Timestamp.FromDateTime(DateTime.UtcNow);
            await _db.Collection(CollectionName).Document(userId).UpdateAsync(fields);
        }

        public async Task SoftDeleteAsync(string userId)
        {
            await _db.Collection(CollectionName).Document(userId).UpdateAsync(new Dictionary<string, object>
            {
                ["deletedAt"] = Timestamp.FromDateTime(DateTime.UtcNow),
                ["isActive"] = false,
                ["updatedAt"] = Timestamp.FromDateTime(DateTime.UtcNow)
            });
        }

        private List<User> ConvertSnapshot(QuerySnapshot snapshot)
        {
            var list = new List<User>();
            foreach (var doc in snapshot.Documents)
            {
                var user = doc.ConvertTo<User>();
                user.Id = doc.Id;
                list.Add(user);
            }
            return list;
        }
    }
}
