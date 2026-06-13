using Google.Cloud.Firestore;
using FoodTour.Api.Models;

namespace FoodTour.Api.Repositories
{
    public class MenuItemRepository
    {
        private readonly FirestoreDb _db;
        private const string CollectionName = "menu_items";

        public MenuItemRepository(Services.FirestoreService firestoreService)
        {
            _db = firestoreService.Db;
        }

        public async Task<List<MenuItem>> GetByPoiIdAsync(string poiId)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("poiId", poiId)
                .OrderByDescending("createdAt")
                .GetSnapshotAsync();

            return ConvertSnapshot(snapshot);
        }

        public async Task<List<MenuItem>> GetAllAsync()
        {
            var snapshot = await _db.Collection(CollectionName)
                .OrderByDescending("createdAt")
                .GetSnapshotAsync();

            return ConvertSnapshot(snapshot);
        }

        public async Task<MenuItem?> GetByIdAsync(string menuItemId)
        {
            var doc = await _db.Collection(CollectionName).Document(menuItemId).GetSnapshotAsync();
            if (!doc.Exists) return null;

            var item = doc.ConvertTo<MenuItem>();
            item.Id = doc.Id;
            return item;
        }

        public async Task<MenuItem> AddAsync(MenuItem menuItem)
        {
            var docRef = _db.Collection(CollectionName).Document();
            menuItem.CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            menuItem.UpdatedAt = menuItem.CreatedAt;
            await docRef.SetAsync(menuItem);
            menuItem.Id = docRef.Id;
            return menuItem;
        }

        public async Task<MenuItem> UpdateAsync(string menuItemId, MenuItem menuItem)
        {
            menuItem.UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            await _db.Collection(CollectionName).Document(menuItemId).SetAsync(menuItem, SetOptions.Overwrite);
            menuItem.Id = menuItemId;
            return menuItem;
        }

        public async Task DeleteAsync(string menuItemId)
        {
            await _db.Collection(CollectionName).Document(menuItemId).DeleteAsync();
        }

        private List<MenuItem> ConvertSnapshot(QuerySnapshot snapshot)
        {
            var list = new List<MenuItem>();
            foreach (var doc in snapshot.Documents)
            {
                var item = doc.ConvertTo<MenuItem>();
                item.Id = doc.Id;
                list.Add(item);
            }
            return list;
        }
    }
}
