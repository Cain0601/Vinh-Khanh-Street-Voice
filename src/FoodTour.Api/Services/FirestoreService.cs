using Google.Cloud.Firestore;
using Microsoft.Extensions.Configuration;

namespace FoodTour.Api.Services
{
    public class FirestoreService
    {
        public FirestoreDb Db { get; }

        public FirestoreService(IConfiguration config)
        {
            // Expect FIREBASE:ProjectId in appsettings or environment
            var projectId = config["Firebase:ProjectId"] ?? System.Environment.GetEnvironmentVariable("FIREBASE_PROJECT_ID");
            if (string.IsNullOrEmpty(projectId))
            {
                throw new System.InvalidOperationException("Firebase ProjectId not configured. Set Firebase:ProjectId in configuration or FIREBASE_PROJECT_ID env var.");
            }

            // Google Cloud client libraries use GOOGLE_APPLICATION_CREDENTIALS env var for service account JSON path
            Db = FirestoreDb.Create(projectId);
        }
    }
}
