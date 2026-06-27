using Google.Cloud.Firestore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FoodTour.Api.Services
{
    public class AdminSettingsService
    {
        private readonly FirestoreDb _db;
        private const string DocPath = "admin_settings/settings";

        public AdminSettingsService(FirestoreService firestoreService)
        {
            _db = firestoreService.DbOrNull!;
        }

        public async Task<Dictionary<string, object>?> GetSettingsAsync()
        {
            try
            {
                var doc = await _db.Document(DocPath).GetSnapshotAsync();
                if (!doc.Exists) return null;
                return doc.ToDictionary();
            }
            catch
            {
                return null;
            }
        }

        public async Task<int?> GetMaxImageSizeAsync()
        {
            var s = await GetSettingsAsync();
            if (s != null && s.TryGetValue("maxImageSizePerUpload", out var v))
            {
                return Convert.ToInt32(v);
            }
            return null;
        }

        public async Task<string[]?> GetAllowedImageMimeTypesAsync()
        {
            var s = await GetSettingsAsync();
            if (s != null && s.TryGetValue("allowedImageMimeTypes", out var v) && v is IEnumerable<object> arr)
            {
                var list = new List<string>();
                foreach (var o in arr) list.Add(o.ToString() ?? "");
                return list.ToArray();
            }
            return null;
        }
    }
}
