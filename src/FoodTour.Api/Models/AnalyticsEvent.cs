using Google.Cloud.Firestore;
using System.Collections.Generic;

namespace FoodTour.Api.Models
{
    [FirestoreData]
    public class AnalyticsEvent
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("type")]
        public string Type { get; set; } = string.Empty; // LISTEN, QR_SCAN, LOCATION, VIEW

        [FirestoreProperty("poiId")]
        public string PoiId { get; set; } = string.Empty;

        [FirestoreProperty("userId")]
        public string? UserId { get; set; }

        [FirestoreProperty("metadata")]
        public Dictionary<string, object>? Metadata { get; set; }

        [FirestoreProperty("createdAt")]
        public Timestamp CreatedAt { get; set; }
    }
}
