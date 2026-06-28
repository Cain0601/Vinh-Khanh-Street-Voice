using Google.Cloud.Firestore;
using System.Collections.Generic;

namespace FoodTour.Api.Models
{
    [FirestoreData]
    public class Poi
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("ownerId")]
        public string OwnerId { get; set; } = string.Empty;

        // Multi-language fields
        [FirestoreProperty("title")]
        public string? Title { get; set; }

        [FirestoreProperty("summary")]
        public string? Summary { get; set; }

        [FirestoreProperty("description")]
        public Dictionary<string, string>? Description { get; set; }

        [FirestoreProperty("audioUrl")]
        public string? AudioUrl { get; set; }

        [FirestoreProperty("categoryId")]
        public string? CategoryId { get; set; }

        [FirestoreProperty("location")]
        public GeoPoint? Location { get; set; }

        [FirestoreProperty("address")]
        public string? Address { get; set; }

        [FirestoreProperty("contact")]
        public Dictionary<string, object>? Contact { get; set; }

        [FirestoreProperty("status")]
        public string? Status { get; set; }

        [FirestoreProperty("visibility")]
        public string? Visibility { get; set; }

        [FirestoreProperty("isActive")]
        public bool IsActive { get; set; } = true;

        [FirestoreProperty("mediaUrl")]
        public string? MediaUrl { get; set; }

        [FirestoreProperty("qrCode")]
        public string? QrCode { get; set; }

        [FirestoreProperty("rating")]
        public double? Rating { get; set; }

        [FirestoreProperty("reviewCount")]
        public int? ReviewCount { get; set; }

        [FirestoreProperty("stats")]
        public Dictionary<string, int>? Stats { get; set; }

        [FirestoreProperty("createdAt")]
        public Timestamp CreatedAt { get; set; }

        [FirestoreProperty("updatedAt")]
        public Timestamp UpdatedAt { get; set; }
    }
}
