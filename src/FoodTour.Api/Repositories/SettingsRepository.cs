using FoodTour.Api.Models;
using Google.Cloud.Firestore;

namespace FoodTour.Api.Repositories
{
    public class SettingsRepository
    {
        private readonly FirestoreDb _db;
        private const string COLLECTION_NAME = "settings";
        private const string DOC_ID = "system";

        public SettingsRepository(Services.FirestoreService firestoreService)
        {
            _db = firestoreService.DbOrNull!;
        }

        public async Task<SystemSettings> GetSettingsAsync()
        {
            var docRef = _db.Collection(COLLECTION_NAME).Document(DOC_ID);
            var snapshot = await docRef.GetSnapshotAsync();
            if (snapshot.Exists)
            {
                return snapshot.ConvertTo<SystemSettings>();
            }
            return new SystemSettings(); // return defaults if not found
        }

        public async Task SaveSettingsAsync(SystemSettings settings)
        {
            var docRef = _db.Collection(COLLECTION_NAME).Document(DOC_ID);
            await docRef.SetAsync(settings, SetOptions.MergeAll);
        }
    }
}
