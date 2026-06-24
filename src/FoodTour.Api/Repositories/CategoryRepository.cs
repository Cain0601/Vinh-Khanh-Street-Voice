using System;
using System.Collections.Generic;
using System.Linq;
using Google.Cloud.Firestore;
using FoodTour.Api.Models;

namespace FoodTour.Api.Repositories
{
    public class CategoryRepository
    {
        private readonly FirestoreDb _db;
        private const string CollectionName = "categories";

        public CategoryRepository(Services.FirestoreService firestoreService)
        {
            _db = firestoreService.DbOrNull!;
        }

        /// <summary>
        /// Get all categories
        /// </summary>
        public async Task<List<Category>> GetAllAsync(bool includeInactive = false)
        {
            var snapshot = await _db.Collection(CollectionName)
                .OrderBy("order")
                .GetSnapshotAsync();

            var list = ConvertSnapshotToCategories(snapshot);
            return includeInactive ? list : list.Where(c => c.Active).ToList();
        }

        /// <summary>
        /// Get a specific category by ID
        /// </summary>
        public async Task<Category?> GetByIdAsync(string categoryId)
        {
            var doc = await _db.Collection(CollectionName).Document(categoryId).GetSnapshotAsync();
            
            if (!doc.Exists)
                return null;

            var category = doc.ConvertTo<Category>();
            category.Id = doc.Id;
            return category;
        }

        /// <summary>
        /// Get category by slug
        /// </summary>
        public async Task<Category?> GetBySlugAsync(string slug)
        {
            var snapshot = await _db.Collection(CollectionName)
                .WhereEqualTo("slug", slug)
                .Limit(1)
                .GetSnapshotAsync();

            if (snapshot.Documents.Count == 0)
                return null;

            var doc = snapshot.Documents[0];
            var category = doc.ConvertTo<Category>();
            category.Id = doc.Id;
            return category;
        }

        /// <summary>
        /// Create a new category
        /// </summary>
        public async Task<Category> AddAsync(Category category)
        {
            var docRef = _db.Collection(CollectionName).Document();
            category.CreatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            category.UpdatedAt = category.CreatedAt;
            await docRef.SetAsync(category);
            category.Id = docRef.Id;
            return category;
        }

        /// <summary>
        /// Update an existing category
        /// </summary>
        public async Task<Category> UpdateAsync(string categoryId, Category category)
        {
            category.UpdatedAt = Timestamp.FromDateTime(DateTime.UtcNow);
            await _db.Collection(CollectionName).Document(categoryId).SetAsync(category, SetOptions.Overwrite);
            category.Id = categoryId;
            return category;
        }

        /// <summary>
        /// Delete a category
        /// </summary>
        public async Task DeleteAsync(string categoryId)
        {
            await _db.Collection(CollectionName).Document(categoryId).DeleteAsync();
        }

        /// <summary>
        /// Helper: Convert Firestore snapshot to list of categories
        /// </summary>
        private List<Category> ConvertSnapshotToCategories(QuerySnapshot snapshot)
        {
            var list = new List<Category>();
            foreach (var doc in snapshot.Documents)
            {
                var category = doc.ConvertTo<Category>();
                category.Id = doc.Id;
                list.Add(category);
            }
            return list;
        }
    }
}
