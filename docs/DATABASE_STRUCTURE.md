# Firestore Database Structure - VinhKhanh Food Tour

## Collections Overview

### 1. **users**
Lưu trữ thông tin người dùng, vai trò, hồ sơ cá nhân.

```json
{
  "uid": "user_123",
  "email": "user@example.com",
  "displayName": "Nguyễn Văn A",
  "role": "USER",  // USER | OWNER | ADMIN
  "phoneNumber": "+84901234567",
  "avatar": "https://storage.com/avatar.jpg",
  "bio": "Food lover",
  "preferences": {
    "language": "vi",
    "notifications": true
  },
  "status": "active",  // active | inactive | banned
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

---

### 2. **categories**
Danh mục POI (Quán cơm, Quán mì, Quán cà phê, etc.)

```json
{
  "id": "cat_001",
  "name": {
    "vi": "Quán Cơm",
    "en": "Rice Restaurant"
  },
  "slug": "quan-com",
  "icon": "https://storage.com/icon-rice.svg",
  "color": "#FF6B6B",
  "description": {
    "vi": "Các quán cơm truyền thống",
    "en": "Traditional rice restaurants"
  },
  "order": 1,
  "active": true,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

---

### 3. **pois** (Points of Interest)
Điểm đến, địa điểm ẩm thực chính.

```json
{
  "id": "poi_001",
  "ownerId": "user_123",
  "title": {
    "vi": "Quán Cơm Chữ A",
    "en": "A's Rice Restaurant"
  },
  "slug": "quan-com-chu-a",
  "summary": {
    "vi": "Quán cơm nổi tiếng với cơm chiên dương châu",
    "en": "Famous for fried rice"
  },
  "description": {
    "vi": "Quán cơm được thành lập từ năm 2015...",
    "en": "Rice restaurant established in 2015..."
  },
  "categoryId": "cat_001",
  "location": GeoPoint(10.7769, 106.7009),  // Tọa độ
  "address": {
    "street": "123 Nguyễn Hữu Cảnh",
    "ward": "Bình Thạnh",
    "district": "Bình Thạnh",
    "city": "TP. Hồ Chí Minh",
    "province": "TP. Hồ Chí Minh",
    "postalCode": "700000"
  },
  "contact": {
    "phoneNumber": "+84901234567",
    "email": "info@quanthanhat.com",
    "website": "https://quanthanhat.com"
  },
  "images": [
    "https://storage.com/poi/001/1.jpg",
    "https://storage.com/poi/001/2.jpg"
  ],
  "avatar": "https://storage.com/poi/001/avatar.jpg",
  "audioGuide": {
    "url": "https://storage.com/poi/001/audio-vi.mp3",
    "language": "vi",
    "durationSeconds": 120
  },
  "openingHours": {
    "Monday": { "open": "06:00", "close": "22:00" },
    "Tuesday": { "open": "06:00", "close": "22:00" },
    // ... other days
  },
  "rating": 4.5,  // Tính toán từ reviews
  "reviewCount": 42,
  "status": "approved",  // pending | approved | rejected | archived
  "visibility": "public",  // public | private | draft
  "tags": ["đặc sản", "nổi tiếng", "giá rẻ"],
  "stats": {
    "viewCount": 1250,
    "favoriteCount": 89,
    "qrScans": 156
  },
  "createdAt": Timestamp,
  "updatedAt": Timestamp,
  "approvedAt": Timestamp
}
```

---

### 4. **menus**
Menu items của mỗi POI.

```json
{
  "id": "menu_001",
  "poiId": "poi_001",
  "ownerId": "user_123",
  "name": {
    "vi": "Cơm Chiên Dương Châu",
    "en": "Fried Rice"
  },
  "description": {
    "vi": "Cơm chiên với trứng, tôm, mực, thịt gà",
    "en": "Fried rice with egg, shrimp, squid, chicken"
  },
  "category": "main",  // main | appetizer | drink | dessert
  "price": 45000,  // VND
  "currency": "VND",
  "image": "https://storage.com/menu/001/menu.jpg",
  "tags": ["vegetarian_option"],
  "available": true,
  "order": 1,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

---

### 5. **reviews**
Đánh giá và phản hồi từ người dùng.

```json
{
  "id": "review_001",
  "poiId": "poi_001",
  "userId": "user_456",
  "rating": 5,  // 1-5
  "title": "Tuyệt vời!",
  "content": "Cơm rất ngon, phục vụ tốt, giá hợp lý",
  "images": [
    "https://storage.com/review/001/1.jpg"
  ],
  "helpful": 12,
  "replies": [
    {
      "userId": "user_123",  // Owner reply
      "content": "Cảm ơn bạn!",
      "createdAt": Timestamp
    }
  ],
  "status": "published",  // published | pending | rejected
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

---

### 6. **bookmarks** (Favorites/Wishlist)
Yêu thích của người dùng.

```json
{
  "id": "bookmark_001",
  "userId": "user_456",
  "poiId": "poi_001",
  "listName": "Chưa thử",  // Optional grouping
  "notes": "Muốn đi thử cơm chiên",
  "createdAt": Timestamp
}
```

---

### 7. **qr_scans**
Thống kê quét QR code từ POI.

```json
{
  "id": "scan_001",
  "poiId": "poi_001",
  "userId": "user_456",  // May be anonymous
  "action": "check_in",  // check_in | view | etc
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "location": GeoPoint(10.7769, 106.7009),  // Optional
  "createdAt": Timestamp
}
```

---

### 8. **audit_logs**
Ghi nhận các thay đổi nhạy cảm cho mục đích audit.

```json
{
  "id": "log_001",
  "userId": "user_123",
  "action": "poi_created",  // poi_created | poi_updated | review_rejected | user_banned | etc
  "resourceType": "poi",  // poi | user | review | etc
  "resourceId": "poi_001",
  "changes": {
    "title": { "old": "...", "new": "..." },
    "status": { "old": "pending", "new": "approved" }
  },
  "adminNotes": "Approved content after verification",
  "ipAddress": "192.168.1.1",
  "createdAt": Timestamp
}
```

---

### 9. **admin_settings**
Cấu hình toàn hệ thống cho admin.

```json
{
  "id": "settings",
  "maxImageSizePerUpload": 5242880,  // 5MB in bytes
  "maxImagesPerPoi": 10,
  "allowedImageMimeTypes": ["image/jpeg", "image/png", "image/webp"],
  "allowUserRegistration": true,
  "requireEmailVerification": true,
  "poiApprovalRequired": true,
  "suspiciousReviewThreshold": 2,
  "updatedAt": Timestamp
}
```

---

## Indexes (Recommended)

### Collection: pois
- `location` (Geo point) - for nearby search
- `categoryId, status, createdAt` (Compound) - for filtered listing
- `ownerId, status` (Compound) - for owner dashboard
- `location, categoryId` (Compound) - for nearby + category filter

### Collection: reviews
- `poiId, status, createdAt` (Compound) - for poi reviews listing
- `userId, createdAt` (Compound) - for user reviews history

### Collection: audit_logs
- `userId, createdAt` (Compound) - for user activity
- `action, createdAt` (Compound) - for filtering by action type

### Collection: qr_scans
- `poiId, createdAt` (Compound) - for poi scan stats

---

## Security Rules (Draft)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId || request.auth.uid != null;
      allow write: if request.auth.uid == userId;
      allow read, write: if request.auth.token.role == 'ADMIN';
    }
    
    // Public reading, owner/admin writing
    match /pois/{poiId} {
      allow read: if true;  // Public data
      allow create: if request.auth.uid != null;
      allow update, delete: if request.auth.uid == resource.data.ownerId || request.auth.token.role == 'ADMIN';
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth.uid != null;
      allow update, delete: if request.auth.uid == resource.data.userId || request.auth.token.role == 'ADMIN';
    }
    
    // Admin only
    match /audit_logs/{logId} {
      allow read: if request.auth.token.role == 'ADMIN';
      allow create: if request.auth.token.role == 'ADMIN' || request.auth != null;
    }
    
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Notes

1. **Subcollections vs Root Collections**: Hiện tại dùng root collections để dễ query. Có thể xem xét subcollections sau nếu cần.
2. **Denormalization**: Một số dữ liệu (rating, reviewCount, stats) được lưu ở POI để query nhanh.
3. **Real-time Updates**: Firestore có thể trigger real-time listeners cho updates.
4. **Pagination**: Sử dụng `startAfter(lastDocument)` cho pagination.
5. **Transactions**: Sử dụng Firestore transactions cho operations liên quan (vd: delete POI + related menus).
