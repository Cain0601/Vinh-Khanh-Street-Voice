using Google.Cloud.Firestore;

namespace FoodTour.Api.Models
{
    [FirestoreData]
    public class ModerationRequest
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("type")]
        public string Type { get; set; } = string.Empty; // POI_CREATE, UPGRADE_OWNER, POI_UPDATE

        [FirestoreProperty("targetId")]
        public string TargetId { get; set; } = string.Empty;

        [FirestoreProperty("requestedBy")]
        public string RequestedBy { get; set; } = string.Empty;

        [FirestoreProperty("status")]
        public string Status { get; set; } = "PENDING"; // PENDING, APPROVED, REJECTED

        [FirestoreProperty("reason")]
        public string? Reason { get; set; }

        [FirestoreProperty("ownerFullName")]
        public string? OwnerFullName { get; set; }

        [FirestoreProperty("ownerPhoneNumber")]
        public string? OwnerPhoneNumber { get; set; }

        [FirestoreProperty("ownerAvatar")]
        public string? OwnerAvatar { get; set; }

        [FirestoreProperty("ownerBrandName")]
        public string? OwnerBrandName { get; set; }

        [FirestoreProperty("createdAt")]
        public Timestamp CreatedAt { get; set; }

        [FirestoreProperty("updatedAt")]
        public Timestamp UpdatedAt { get; set; }
    }
}
