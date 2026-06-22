using Google.Cloud.Firestore;
using FoodTour.Api.Models;

namespace FoodTour.Api.Repositories
{
    public class MenuItemRepository
    {
        private readonly FirestoreDb? _db;
        private const string CollectionName = "menu_items";

        // In-memory store used when DEV_FIRESTORE_MOCK=true
        private static readonly Dictionary<string, Models.MenuItem> _memoryStore = new();
        private static readonly object _memoryLock = new();

        // Constructor used when real Firestore is available
        public MenuItemRepository(Services.FirestoreService firestoreService)
        {
            _db = firestoreService.DbOrNull!;
        }

        // Parameterless constructor used by DI when dev mock is enabled (no FirestoreService registered)
        public MenuItemRepository()
        {
            _db = null;
        }

        public async Task<List<MenuItem>> GetByPoiIdAsync(string poiId)
        {
            if (_db == null)
            {
                List<MenuItem> list;
                lock (_memoryLock)
                {
                    list = _memoryStore.Values.Where(i => i.PoiId == poiId)
                        .OrderByDescending(i => i.CreatedAt.ToDateTime())
                        .ToList();
                }
                return await Task.FromResult(list);
            }

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
            menuItem.CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            menuItem.UpdatedAt = menuItem.CreatedAt;

            if (_db == null)
            {
                // In-memory add
                var id = System.Guid.NewGuid().ToString();
                menuItem.Id = id;
                lock (_memoryLock)
                {
                    _memoryStore[id] = menuItem;
                }
                return await Task.FromResult(menuItem);
            }

            var docRef = _db.Collection(CollectionName).Document();
            await docRef.SetAsync(menuItem);
            menuItem.Id = docRef.Id;
            return menuItem;
        }

        public async Task<MenuItem> UpdateAsync(string menuItemId, MenuItem menuItem)
        {
            menuItem.UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow);

            if (_db == null)
            {
                lock (_memoryLock)
                {
                    if (_memoryStore.ContainsKey(menuItemId))
                    {
                        menuItem.Id = menuItemId;
                        _memoryStore[menuItemId] = menuItem;
                        return Task.FromResult(menuItem).Result;
                    }
                    else
                    {
                        throw new KeyNotFoundException("Menu item not found");
                    }
                }
            }

            await _db.Collection(CollectionName).Document(menuItemId).SetAsync(menuItem, SetOptions.Overwrite);
            menuItem.Id = menuItemId;
            return menuItem;
        }

        public async Task DeleteAsync(string menuItemId)
        {
            if (_db == null)
            {
                lock (_memoryLock)
                {
                    _memoryStore.Remove(menuItemId);
                }
                return;
            }

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
