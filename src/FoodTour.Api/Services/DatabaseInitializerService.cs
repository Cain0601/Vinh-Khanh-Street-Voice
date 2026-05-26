using Google.Cloud.Firestore;
using FoodTour.Api.Models;

namespace FoodTour.Api.Services
{
    public class DatabaseInitializerService
    {
        private readonly FirestoreDb _db;

        public DatabaseInitializerService(FirestoreService firestoreService)
        {
            _db = firestoreService.Db;
        }

        /// <summary>
        /// Initialize database with default categories and settings
        /// Run this once during startup or manually when needed
        /// </summary>
        public async Task InitializeAsync()
        {
            Console.WriteLine("🔧 Initializing Firestore database...");

            // If CLEAR_DB env var is set, wipe existing collections first
            if (Environment.GetEnvironmentVariable("CLEAR_DB") == "1")
            {
                await ClearDatabaseAsync();
            }

            await CreateDefaultCategoriesAsync();
            await CreateAdminSettingsAsync();
            await CreateSamplePoiAsync();
            await CreateSampleUsersAsync();
            await CreateMenuItemsAsync();
            await CreateBookmarksAsync();
            await CreateReviewsAsync();
            await CreateModerationRequestsAsync();
            await CreateAuditLogsAsync();
            await CreateAnalyticsEventsAsync();

            Console.WriteLine("✅ Database initialization completed!");
        }

        private async Task CreateDefaultCategoriesAsync()
        {
            Console.WriteLine("📂 Creating default categories...");

            var categories = new[]
            {
                new
                {
                    id = "cat_rice",
                    name = new { vi = "Quán Cơm", en = "Rice Restaurant" },
                    slug = "quan-com",
                    color = "#FF6B6B",
                    order = 1
                },
                new
                {
                    id = "cat_noodle",
                    name = new { vi = "Quán Mì", en = "Noodle Shop" },
                    slug = "quan-mi",
                    color = "#4ECDC4",
                    order = 2
                },
                new
                {
                    id = "cat_coffee",
                    name = new { vi = "Quán Cà Phê", en = "Coffee Shop" },
                    slug = "quan-ca-phe",
                    color = "#95E1D3",
                    order = 3
                },
                new
                {
                    id = "cat_banh_mi",
                    name = new { vi = "Bánh Mì", en = "Banh Mi" },
                    slug = "banh-mi",
                    color = "#F38181",
                    order = 4
                },
                new
                {
                    id = "cat_pho",
                    name = new { vi = "Phở", en = "Pho" },
                    slug = "pho",
                    color = "#AA96DA",
                    order = 5
                }
            };

            var categoriesRef = _db.Collection("categories");

            foreach (var cat in categories)
            {
                try
                {
                    await categoriesRef.Document(cat.id).SetAsync(new
                    {
                        name = cat.name,
                        slug = cat.slug,
                        color = cat.color,
                        order = cat.order,
                        active = true,
                        createdAt = Timestamp.FromDateTime(DateTime.UtcNow),
                        updatedAt = Timestamp.FromDateTime(DateTime.UtcNow)
                    });
                    Console.WriteLine($"  ✓ Created category: {cat.name}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"  ✗ Error creating category {cat.id}: {ex.Message}");
                }
            }
        }

        private async Task CreateAdminSettingsAsync()
        {
            Console.WriteLine("⚙️ Creating admin settings...");

            try
            {
                await _db.Collection("admin_settings").Document("settings").SetAsync(new
                {
                    maxImageSizePerUpload = 5242880,  // 5MB
                    maxImagesPerPoi = 10,
                    allowedImageMimeTypes = new[] { "image/jpeg", "image/png", "image/webp" },
                    allowUserRegistration = true,
                    requireEmailVerification = true,
                    poiApprovalRequired = true,
                    suspiciousReviewThreshold = 2,
                    updatedAt = Timestamp.FromDateTime(DateTime.UtcNow)
                });
                Console.WriteLine("  ✓ Created admin settings");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"  ✗ Error creating admin settings: {ex.Message}");
            }
        }

        private async Task CreateSamplePoiAsync()
        {
            Console.WriteLine("🍲 Creating sample POI...");

            var samplePois = new[]
            {
                new
                {
                    title = new { vi = "Quán Cơm Chữ A", en = "A's Rice Restaurant" },
                    summary = new { vi = "Quán cơm nổi tiếng với cơm chiên dương châu", en = "Famous for fried rice" },
                    categoryId = "cat_rice",
                    lat = 10.7769,
                    lng = 106.7009,
                    address = "123 Nguyễn Hữu Cảnh, Bình Thạnh, TP. Hồ Chí Minh",
                    phone = "+84901234567"
                },
                new
                {
                    title = new { vi = "Phở Thần Kì", en = "Pho Miracle" },
                    summary = new { vi = "Phở truyền thống Hà Nội", en = "Traditional Hanoi pho" },
                    categoryId = "cat_pho",
                    lat = 10.7850,
                    lng = 106.6950,
                    address = "456 Lý Tự Trọng, Bình Thạnh, TP. Hồ Chí Minh",
                    phone = "+84902345678"
                },
                new
                {
                    title = new { vi = "Cà Phê Phin Cò", en = "Old Phin Coffee" },
                    summary = new { vi = "Cà phê truyền thống phin đơn", en = "Traditional single-filter coffee" },
                    categoryId = "cat_coffee",
                    lat = 10.7920,
                    lng = 106.7080,
                    address = "789 Hai Bà Trưng, Bình Thạnh, TP. Hồ Chí Minh",
                    phone = "+84903456789"
                }
            };

            var poisRef = _db.Collection("pois");

            // Use a demo owner ID - in production, this should be a real user
            var demoOwnerId = "demo_owner_001";

            foreach (var poi in samplePois)
            {
                try
                {
                    var newDoc = await poisRef.AddAsync(new
                    {
                        ownerId = demoOwnerId,
                        title = poi.title,
                        summary = poi.summary,
                        categoryId = poi.categoryId,
                        location = new GeoPoint(poi.lat, poi.lng),
                        address = poi.address,
                        contact = new { phoneNumber = poi.phone },
                        status = "approved",
                        visibility = "public",
                        rating = 4.5,
                        reviewCount = 0,
                        stats = new
                        {
                            viewCount = 0,
                            favoriteCount = 0,
                            qrScans = 0
                        },
                        createdAt = Timestamp.FromDateTime(DateTime.UtcNow),
                        updatedAt = Timestamp.FromDateTime(DateTime.UtcNow),
                        approvedAt = Timestamp.FromDateTime(DateTime.UtcNow)
                    });
                    Console.WriteLine($"  ✓ Created POI: {poi.title}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"  ✗ Error creating POI {poi.title}: {ex.Message}");
                }
            }
        }
        private async Task CreateSampleUsersAsync()
        {
            Console.WriteLine("👤 Creating sample users...");
            var usersRef = _db.Collection("users");
            var sampleUsers = new[]
            {
                new { uid = "user_001", email = "alice@example.com", displayName = new { vi = "Alice", en = "Alice" }, role = "admin" },
                new { uid = "user_002", email = "bob@example.com", displayName = new { vi = "Bob", en = "Bob" }, role = "user" }
            };
            foreach (var u in sampleUsers)
            {
                try
                {
                    await usersRef.Document(u.uid).SetAsync(new
                    {
                        email = u.email,
                        displayName = u.displayName,
                        role = u.role,
                        createdAt = Timestamp.FromDateTime(DateTime.UtcNow),
                        updatedAt = Timestamp.FromDateTime(DateTime.UtcNow)
                    });
                    Console.WriteLine($"  ✓ Created user: {u.uid}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"  ✗ Error creating user {u.uid}: {ex.Message}");
                }
            }
        }

        private async Task CreateMenuItemsAsync()
        {
            Console.WriteLine("📋 Creating sample menu items...");
            var menuRef = _db.Collection("menu_items");
            var sampleMenus = new[]
            {
                new { id = "menu_001", title = new { vi = "Cơm Gà", en = "Chicken Rice" }, price = 50000, categoryId = "cat_rice" },
                new { id = "menu_002", title = new { vi = "Phở Bò", en = "Beef Pho" }, price = 65000, categoryId = "cat_pho" }
            };
            foreach (var m in sampleMenus)
            {
                try
                {
                    await menuRef.Document(m.id).SetAsync(new
                    {
                        title = m.title,
                        price = m.price,
                        categoryId = m.categoryId,
                        createdAt = Timestamp.FromDateTime(DateTime.UtcNow),
                        updatedAt = Timestamp.FromDateTime(DateTime.UtcNow)
                    });
                    Console.WriteLine($"  ✓ Created menu item: {m.id}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"  ✗ Error creating menu item {m.id}: {ex.Message}");
                }
            }
        }

        private async Task CreateBookmarksAsync()
        {
            Console.WriteLine("🔖 Creating sample bookmarks...");
            var bmRef = _db.Collection("bookmarks");
            var sampleBMs = new[]
            {
                new { id = "bm_001", userId = "user_001", poiId = "poi_1", createdAt = Timestamp.FromDateTime(DateTime.UtcNow) },
                new { id = "bm_002", userId = "user_002", poiId = "poi_2", createdAt = Timestamp.FromDateTime(DateTime.UtcNow) }
            };
            foreach (var bm in sampleBMs)
            {
                try
                {
                    await bmRef.Document(bm.id).SetAsync(new
                    {
                        userId = bm.userId,
                        poiId = bm.poiId,
                        createdAt = bm.createdAt
                    });
                    Console.WriteLine($"  ✓ Created bookmark: {bm.id}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"  ✗ Error creating bookmark {bm.id}: {ex.Message}");
                }
            }
        }

        private async Task CreateReviewsAsync()
        {
            Console.WriteLine("📝 Creating sample reviews...");
            var revRef = _db.Collection("reviews");
            var sampleReviews = new[]
            {
                new { id = "rev_001", userId = "user_001", poiId = "poi_1", rating = 5, comment = new { vi = "Tuyệt vời!", en = "Great!" }, createdAt = Timestamp.FromDateTime(DateTime.UtcNow) },
                new { id = "rev_002", userId = "user_002", poiId = "poi_2", rating = 4, comment = new { vi = "Ổn", en = "Good" }, createdAt = Timestamp.FromDateTime(DateTime.UtcNow) }
            };
            foreach (var r in sampleReviews)
            {
                try
                {
                    await revRef.Document(r.id).SetAsync(new
                    {
                        userId = r.userId,
                        poiId = r.poiId,
                        rating = r.rating,
                        comment = r.comment,
                        createdAt = r.createdAt,
                        updatedAt = Timestamp.FromDateTime(DateTime.UtcNow)
                    });
                    Console.WriteLine($"  ✓ Created review: {r.id}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"  ✗ Error creating review {r.id}: {ex.Message}");
                }
            }
        }

        private async Task CreateModerationRequestsAsync()
        {
            Console.WriteLine("⚖️ Creating sample moderation requests...");
            var modRef = _db.Collection("moderation_requests");
            var sampleMods = new[]
            {
                new { id = "mod_001", poiId = "poi_1", requestedBy = "user_002", reason = "Inappropriate content", status = "pending", createdAt = Timestamp.FromDateTime(DateTime.UtcNow) }
            };
            foreach (var m in sampleMods)
            {
                try
                {
                    await modRef.Document(m.id).SetAsync(new
                    {
                        poiId = m.poiId,
                        requestedBy = m.requestedBy,
                        reason = m.reason,
                        status = m.status,
                        createdAt = m.createdAt,
                        updatedAt = Timestamp.FromDateTime(DateTime.UtcNow)
                    });
                    Console.WriteLine($"  ✓ Created moderation request: {m.id}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"  ✗ Error creating moderation request {m.id}: {ex.Message}");
                }
            }
        }

        private async Task CreateAuditLogsAsync()
        {
            Console.WriteLine("📜 Creating sample audit logs...");
            var auditRef = _db.Collection("audit_logs");
            var sampleAudits = new[]
            {
                new { id = "audit_001", action = "poi_created", performedBy = "system", targetId = "poi_1", timestamp = Timestamp.FromDateTime(DateTime.UtcNow) }
            };
            foreach (var a in sampleAudits)
            {
                try
                {
                    await auditRef.Document(a.id).SetAsync(new
                    {
                        action = a.action,
                        performedBy = a.performedBy,
                        targetId = a.targetId,
                        timestamp = a.timestamp
                    });
                    Console.WriteLine($"  ✓ Created audit log: {a.id}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"  ✗ Error creating audit log {a.id}: {ex.Message}");
                }
            }
        }

        private async Task CreateAnalyticsEventsAsync()
        {
            Console.WriteLine("📊 Creating sample analytics events...");
            var analyticsRef = _db.Collection("analytics_events");
            var sampleEvents = new[]
            {
                new { id = "event_001", type = "view", entityId = "poi_1", userId = "user_001", timestamp = Timestamp.FromDateTime(DateTime.UtcNow) }
            };
            foreach (var e in sampleEvents)
            {
                try
                {
                    await analyticsRef.Document(e.id).SetAsync(new
                    {
                        type = e.type,
                        entityId = e.entityId,
                        userId = e.userId,
                        timestamp = e.timestamp
                    });
                    Console.WriteLine($"  ✓ Created analytics event: {e.id}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"  ✗ Error creating analytics event {e.id}: {ex.Message}");
                }
            }
        }


    // Clears all known collections
    private async Task ClearDatabaseAsync()
    {
        Console.WriteLine("🗑️ Clearing existing Firestore data...");
        var collections = new[] { "categories", "pois", "admin_settings", "users", "menu_items", "bookmarks", "reviews", "moderation_requests", "audit_logs", "analytics_events" };
        foreach (var col in collections)
        {
            try
            {
                var colRef = _db.Collection(col);
                var snapshots = await colRef.ListDocumentsAsync().ToListAsync();
                foreach (var doc in snapshots)
                {
                    await doc.DeleteAsync();
                }
                Console.WriteLine($"  ✓ Cleared collection: {col}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"  ✗ Error clearing collection {col}: {ex.Message}");
            }
        }
    }
}
}


