using Google.Cloud.Firestore;

namespace FoodTour.Api.Models
{
    [FirestoreData]
    public class Category
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("name")]
        public Dictionary<string, string> Name { get; set; } = new();  // { "vi": "Quán Cơm", "en": "Rice Restaurant" }

        [FirestoreProperty("slug")]
        public string Slug { get; set; } = string.Empty;

        [FirestoreProperty("icon")]
        public string? Icon { get; set; }

        [FirestoreProperty("color")]
        public string? Color { get; set; }

        [FirestoreProperty("description")]
        public Dictionary<string, string>? Description { get; set; }

        [FirestoreProperty("order")]
        public int Order { get; set; }

        [FirestoreProperty("active")]
        public bool Active { get; set; } = true;

        [FirestoreProperty("createdAt")]
        public Timestamp CreatedAt { get; set; }

        [FirestoreProperty("updatedAt")]
        public Timestamp UpdatedAt { get; set; }
    }
}
