using Google.Cloud.Firestore;
using Microsoft.Extensions.Configuration;

namespace FoodTour.Api.Services
{
    public class FirestoreService
    {
        /// <summary>Nullable backing field — null when credentials are missing.</summary>
        private FirestoreDb? _db;

        /// <summary>
        /// Throws a clear InvalidOperationException when Firestore is not configured,
        /// so the global exception handler can return a helpful 500 JSON (not NPE).
        /// Use in repository <em>methods</em> (not constructors) to surface a clean error.
        /// </summary>
        public FirestoreDb Db => _db ?? throw new InvalidOperationException(
            "Firestore is not available. " +
            "Copy your service_account.json to the FoodTour.Api folder and restart. " +
            "GOOGLE_APPLICATION_CREDENTIALS must point to a valid service account file.");

        /// <summary>
        /// Returns the underlying FirestoreDb without throwing.
        /// Safe to call from repository constructors — null means credentials are missing.
        /// </summary>
        public FirestoreDb? DbOrNull => _db;

        public FirestoreService(IConfiguration config)
        {
            var projectId = config["Firebase:ProjectId"] ?? System.Environment.GetEnvironmentVariable("FIREBASE_PROJECT_ID");
            if (string.IsNullOrEmpty(projectId))
            {
                Console.WriteLine("⚠️  FirestoreService: Firebase ProjectId not configured — Db will be null.");
                return;
            }

            try
            {
                _db = FirestoreDb.Create(projectId);
                Console.WriteLine($"✅ FirestoreDb connected to project '{projectId}'.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️  FirestoreDb.Create failed: {ex.Message}");
                Console.WriteLine("⚠️  Db is null — add service_account.json and restart to enable data access.");
                // _db stays null; accessing .Db property will throw a clear error
            }
        }
    }
}
