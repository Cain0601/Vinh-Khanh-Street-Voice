using Google.Cloud.Firestore;

namespace FoodTour.Api.Models
{
    [FirestoreData]
    public class SystemSettings
    {
        [FirestoreProperty("siteName")]
        public string? SiteName { get; set; } = "VinhKhanh Food Tour";

        [FirestoreProperty("defaultLanguage")]
        public string? DefaultLanguage { get; set; } = "vi";

        [FirestoreProperty("autoApproval")]
        public bool AutoApproval { get; set; } = false;

        [FirestoreProperty("requireOnboarding")]
        public bool RequireOnboarding { get; set; } = true;

        [FirestoreProperty("maxUploadSize")]
        public int MaxUploadSize { get; set; } = 10;

        [FirestoreProperty("enableAnalytics")]
        public bool EnableAnalytics { get; set; } = true;

        [FirestoreProperty("enableNotifications")]
        public bool EnableNotifications { get; set; } = true;

        [FirestoreProperty("maintenanceMode")]
        public bool MaintenanceMode { get; set; } = false;
    }
}
