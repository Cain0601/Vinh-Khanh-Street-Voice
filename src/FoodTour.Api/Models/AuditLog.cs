using Google.Cloud.Firestore;

namespace FoodTour.Api.Models
{
    [FirestoreData]
    public class AuditLog
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("adminId")]
        public string AdminId { get; set; } = string.Empty;

        [FirestoreProperty("action")]
        public string Action { get; set; } = string.Empty;

        [FirestoreProperty("targetId")]
        public string TargetId { get; set; } = string.Empty;

        [FirestoreProperty("oldValue")]
        public string? OldValue { get; set; } // JSON string

        [FirestoreProperty("newValue")]
        public string? NewValue { get; set; } // JSON string

        [FirestoreProperty("ipAddress")]
        public string? IpAddress { get; set; }

        [FirestoreProperty("userAgent")]
        public string? UserAgent { get; set; }

        [FirestoreProperty("createdAt")]
        public Timestamp CreatedAt { get; set; }
    }
}
