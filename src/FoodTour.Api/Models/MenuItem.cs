using Google.Cloud.Firestore;

namespace FoodTour.Api.Models
{
    [FirestoreData]
    public class MenuItem
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("poiId")]
        public string PoiId { get; set; } = string.Empty;

        [FirestoreProperty("price")]
        public double Price { get; set; }

        [FirestoreProperty("mediaUrl")]
        public string? MediaUrl { get; set; }

        // Multi-language name
        [FirestoreProperty("name")]
        public Dictionary<string, string> Name { get; set; } = new();

        // Multi-language description
        [FirestoreProperty("description")]
        public Dictionary<string, string>? Description { get; set; }

        [FirestoreProperty("isActive")]
        public bool IsActive { get; set; } = true;

        [FirestoreProperty("createdAt")]
        public Timestamp CreatedAt { get; set; }

        [FirestoreProperty("updatedAt")]
        public Timestamp UpdatedAt { get; set; }
    }
}
