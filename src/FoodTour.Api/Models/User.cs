using Google.Cloud.Firestore;

namespace FoodTour.Api.Models
{
    [FirestoreData]
    public class User
    {
        [FirestoreProperty("id")]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty("email")]
        public string Email { get; set; } = string.Empty;

        [FirestoreProperty("fullName")]
        public string FullName { get; set; } = string.Empty;

        [FirestoreProperty("role")]
        public string Role { get; set; } = "USER"; // USER, OWNER, ADMIN

        [FirestoreProperty("language")]
        public string Language { get; set; } = "vi";

        [FirestoreProperty("isActive")]
        public bool IsActive { get; set; } = true;

        [FirestoreProperty("isOnboarded")]
        public bool IsOnboarded { get; set; } = false;

        [FirestoreProperty("createdAt")]
        public Timestamp CreatedAt { get; set; }

        [FirestoreProperty("updatedAt")]
        public Timestamp UpdatedAt { get; set; }

        [FirestoreProperty("deletedAt")]
        public Timestamp? DeletedAt { get; set; }
    }
}
