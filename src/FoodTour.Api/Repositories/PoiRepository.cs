using System;
using System.Collections.Generic;
using System.Linq;
using Google.Cloud.Firestore;
using FoodTour.Api.Models;

namespace FoodTour.Api.Repositories
{
    public class PoiRepository
    {
        private readonly FirestoreDb _db;
        private const string CollectionName = "pois";

        public PoiRepository(Services.FirestoreService firestoreService)
        {
            _db = firestoreService.Db;
        }

        /// <summary>
        /// Get all POIs (with optional filters)
        /// </summary>
        public async Task<List<Poi>> GetAllAsync()
        {
            var snapshot = await _db.Collection(CollectionName)
                .OrderByDescending("createdAt")
                .GetSnapshotAsync();

            var list = ConvertSnapshotToPois(snapshot);
            return list.Where(p => string.Equals(p.Status, "approved", StringComparison.OrdinalIgnoreCase)).ToList();
        }
        
        /// <summary>
        /// Get all POIs without status filtering (admin use)
        /// </summary>
        public async Task<List<Poi>> GetAllUnfilteredAsync()
        {
            var snapshot = await _db.Collection(CollectionName)
                .OrderByDescending("createdAt")
                .GetSnapshotAsync();

            return ConvertSnapshotToPois(snapshot);
        }

        /// <summary>
        /// Get all POIs for a specific owner
        /// </summary>
        public async Task<List<Poi>> GetByOwnerAsync(string ownerId)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("ownerId", ownerId)
                .OrderByDescending("createdAt")
                .GetSnapshotAsync();

            // owner-specific queries are usually small; return all and let client filter if needed
            return ConvertSnapshotToPois(snapshot);
        }

        /// <summary>
        /// Get POIs by category
        /// </summary>
        public async Task<List<Poi>> GetByCategoryAsync(string categoryId)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("categoryId", categoryId)
                .OrderByDescending("createdAt")
                .GetSnapshotAsync();

            var list = ConvertSnapshotToPois(snapshot);
            return list.Where(p => string.Equals(p.Status, "approved", StringComparison.OrdinalIgnoreCase)).ToList();
        }

        /// <summary>
        /// Get a single POI by ID
        /// </summary>
        public async Task<Poi?> GetByIdAsync(string poiId)
        {
            var doc = await _db.Collection(CollectionName).Document(poiId).GetSnapshotAsync();
            
            if (!doc.Exists)
                return null;

            var poi = doc.ConvertTo<Poi>();
            poi.Id = doc.Id;
            return poi;
        }

        /// <summary>
        /// Create a new POI
        /// </summary>
        public async Task<Poi> AddAsync(Poi poi)
        {
            var docRef = _db.Collection(CollectionName).Document();
            poi.CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            poi.UpdatedAt = poi.CreatedAt;
            await docRef.SetAsync(poi);
            poi.Id = docRef.Id;
            return poi;
        }

        /// <summary>
        /// Update an existing POI
        /// </summary>
        public async Task<Poi> UpdateAsync(string poiId, Poi poi)
        {
            poi.UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            await _db.Collection(CollectionName).Document(poiId).SetAsync(poi, SetOptions.Overwrite);
            poi.Id = poiId;
            return poi;
        }

        /// <summary>
        /// Partially update POI fields
        /// </summary>
        public async Task UpdateFieldsAsync(string poiId, Dictionary<string, object> fields)
        {
            fields["updatedAt"] = Timestamp.FromDateTime(DateTime.UtcNow);
            await _db.Collection(CollectionName).Document(poiId).UpdateAsync(fields);
        }

        /// <summary>
        /// Delete a POI
        /// </summary>
        public async Task DeleteAsync(string poiId)
        {
            await _db.Collection(CollectionName).Document(poiId).DeleteAsync();
        }

        /// <summary>
        /// Get POIs pending approval
        /// </summary>
        public async Task<List<Poi>> GetPendingApprovalAsync()
        {
            var snapshot = await _db.Collection(CollectionName)
                .OrderByDescending("createdAt")
                .GetSnapshotAsync();

            var list = ConvertSnapshotToPois(snapshot);
            return list.Where(p => string.Equals(p.Status, "pending", StringComparison.OrdinalIgnoreCase)).ToList();
        }

        /// <summary>
        /// Helper: Convert Firestore snapshot to list of POIs
        /// </summary>
        private List<Poi> ConvertSnapshotToPois(QuerySnapshot snapshot)
        {
            var list = new List<Poi>();
            foreach (var doc in snapshot.Documents)
            {
                var poi = doc.ConvertTo<Poi>();
                poi.Id = doc.Id;
                list.Add(poi);
            }
            return list;
        }
    }
}
