using Google.Cloud.Firestore;
using FoodTour.Api.Models;

namespace FoodTour.Api.Repositories
{
    public class ReviewRepository
    {
        private readonly FirestoreDb _db;
        private const string CollectionName = "reviews";

        public ReviewRepository(Services.FirestoreService firestoreService)
        {
            _db = firestoreService.Db;
        }

        public async Task<List<Review>> GetByPoiIdAsync(string poiId)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("poiId", poiId)
                .OrderByDescending("createdAt")
                .GetSnapshotAsync();

            return ConvertSnapshot(snapshot);
        }

        public async Task<List<Review>> GetByUserIdAsync(string userId)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("userId", userId)
                .OrderByDescending("createdAt")
                .GetSnapshotAsync();

            return ConvertSnapshot(snapshot);
        }

        public async Task<Review?> GetByIdAsync(string reviewId)
        {
            var doc = await _db.Collection(CollectionName).Document(reviewId).GetSnapshotAsync();
            if (!doc.Exists) return null;

            var review = doc.ConvertTo<Review>();
            review.Id = doc.Id;
            return review;
        }

        public async Task<Review> AddAsync(Review review)
        {
            var docRef = _db.Collection(CollectionName).Document();
            review.CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            review.UpdatedAt = review.CreatedAt;
            await docRef.SetAsync(review);
            review.Id = docRef.Id;
            return review;
        }

        public async Task<Review> UpdateAsync(string reviewId, Review review)
        {
            review.UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            await _db.Collection(CollectionName).Document(reviewId).SetAsync(review, SetOptions.Overwrite);
            review.Id = reviewId;
            return review;
        }

        public async Task DeleteAsync(string reviewId)
        {
            await _db.Collection(CollectionName).Document(reviewId).DeleteAsync();
        }

        private List<Review> ConvertSnapshot(QuerySnapshot snapshot)
        {
            var list = new List<Review>();
            foreach (var doc in snapshot.Documents)
            {
                var review = doc.ConvertTo<Review>();
                review.Id = doc.Id;
                list.Add(review);
            }
            return list;
        }
    }
}
