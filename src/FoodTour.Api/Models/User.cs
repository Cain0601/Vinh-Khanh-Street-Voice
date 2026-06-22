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

        // Owner profile fields
        [FirestoreProperty("phoneNumber")]
        public string? PhoneNumber { get; set; }

        [FirestoreProperty("avatar")]
        public string? Avatar { get; set; }

        // Brand/store display name for owner
        [FirestoreProperty("brandName")]
        public string? BrandName { get; set; }

        [FirestoreProperty("isOnboarded")]
        public bool IsOnboarded { get; set; } = false;

        [FirestoreProperty("preferences")]
        public UserPreferences Preferences { get; set; } = new();

        [FirestoreProperty("isActive")]
        public bool IsActive { get; set; } = true;

        [FirestoreProperty("createdAt")]
        public Timestamp CreatedAt { get; set; }

        [FirestoreProperty("updatedAt")]
        public Timestamp UpdatedAt { get; set; }

        [FirestoreProperty("deletedAt")]
        public Timestamp? DeletedAt { get; set; }

        [FirestoreData]
        public class UserPreferences
        {
            [FirestoreProperty("notifications")]
            public NotificationsPreference Notifications { get; set; } = new();

            // default visibility/active status for POIs (owner setting)
            [FirestoreProperty("poiDefaultIsActive")]
            public bool PoiDefaultIsActive { get; set; } = true;
        }

        [FirestoreData]
        public class NotificationsPreference
        {
            [FirestoreProperty("email")]
            public bool Email { get; set; } = true;
        }
    }
}
