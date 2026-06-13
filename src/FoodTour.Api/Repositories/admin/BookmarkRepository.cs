using Google.Cloud.Firestore;
using FoodTour.Api.Models;

namespace FoodTour.Api.Repositories
{
    public class BookmarkRepository
    {
        private readonly FirestoreDb _db;
        private const string CollectionName = "bookmarks";

        public BookmarkRepository(Services.FirestoreService firestoreService)
        {
            _db = firestoreService.Db;
        }

        public async Task<List<Bookmark>> GetByUserIdAsync(string userId)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("userId", userId)
                .OrderByDescending("createdAt")
                .GetSnapshotAsync();

            return ConvertSnapshot(snapshot);
        }

        public async Task<Bookmark?> GetByUserAndPoiAsync(string userId, string poiId)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("userId", userId)
                .WhereEqualTo("poiId", poiId)
                .Limit(1)
                .GetSnapshotAsync();

            if (snapshot.Documents.Count == 0) return null;

            var doc = snapshot.Documents[0];
            var bookmark = doc.ConvertTo<Bookmark>();
            bookmark.Id = doc.Id;
            return bookmark;
        }

        public async Task<Bookmark> AddAsync(Bookmark bookmark)
        {
            var docRef = _db.Collection(CollectionName).Document();
            bookmark.CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            await docRef.SetAsync(bookmark);
            bookmark.Id = docRef.Id;
            return bookmark;
        }

        public async Task DeleteAsync(string bookmarkId)
        {
            await _db.Collection(CollectionName).Document(bookmarkId).DeleteAsync();
        }

        public async Task DeleteByUserAndPoiAsync(string userId, string poiId)
        {
            var bookmark = await GetByUserAndPoiAsync(userId, poiId);
            if (bookmark != null)
            {
                await DeleteAsync(bookmark.Id);
            }
        }

        private List<Bookmark> ConvertSnapshot(QuerySnapshot snapshot)
        {
            var list = new List<Bookmark>();
            foreach (var doc in snapshot.Documents)
            {
                var bookmark = doc.ConvertTo<Bookmark>();
                bookmark.Id = doc.Id;
                list.Add(bookmark);
            }
            return list;
        }
    }
}
