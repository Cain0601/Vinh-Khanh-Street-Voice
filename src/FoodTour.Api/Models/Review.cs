using Google.Cloud.Firestore;

namespace FoodTour.Api.Models
{
    [FirestoreData]
    public class Review
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("poiId")]
        public string PoiId { get; set; } = string.Empty;

        [FirestoreProperty("userId")]
        public string UserId { get; set; } = string.Empty;

        [FirestoreProperty("rating")]
        public int Rating { get; set; }

        [FirestoreProperty("comment")]
        public string? Comment { get; set; }

        [FirestoreProperty("createdAt")]
        public Timestamp CreatedAt { get; set; }

        [FirestoreProperty("updatedAt")]
        public Timestamp UpdatedAt { get; set; }
    }
}
