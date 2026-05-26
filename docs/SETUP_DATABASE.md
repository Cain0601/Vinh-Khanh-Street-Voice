# 📊 Database Initialization Guide

## Bước 1: Chuẩn bị
Đảm bảo bạn đã:
- ✅ Kích hoạt Cloud Firestore API trong Firebase Console
  - Link: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=vinh-khanh-street-voice
- ✅ Có service account JSON file (`E:\VSCode\service_account.json`)
- ✅ Biến môi trường `FIREBASE_PROJECT_ID` được set

## Bước 2: Khởi tạo Database

### Cách 1: Sử dụng Script PowerShell (Khuyến nghị)

```powershell
# Từ thư mục gốc project
.\scripts\init-database.ps1
```

Script sẽ:
1. ✓ Kiểm tra service account file
2. ✓ Set environment variables
3. ✓ Chạy backend với `INIT_DB=1` để khởi tạo collections
4. ✓ Backend sẽ tự động tạo:
   - 5 categories mặc định (Quán Cơm, Quán Mì, Cà Phê, Bánh Mì, Phở)
   - Admin settings
   - 3 sample POI để test

### Cách 2: Chạy Manual

```powershell
# Thiết lập environment
$env:GOOGLE_APPLICATION_CREDENTIALS='E:\VSCode\service_account.json'
$env:FIREBASE_PROJECT_ID='vinh-khanh-street-voice'
$env:INIT_DB='1'

# Chạy backend
cd src\FoodTour.Api
dotnet run --urls http://localhost:5190
```

## Bước 3: Xác nhận Khởi tạo

Khi backend khởi động, bạn sẽ thấy logs như sau:

```
🔧 Initializing Firestore database...
📂 Creating default categories...
  ✓ Created category: Quán Cơm
  ✓ Created category: Quán Mì
  ✓ Created category: Quán Cà Phê
  ✓ Created category: Bánh Mì
  ✓ Created category: Phở
⚙️ Creating admin settings...
  ✓ Created admin settings
🍲 Creating sample POI...
  ✓ Created POI: Quán Cơm Chữ A
  ✓ Created POI: Phở Thần Kì
  ✓ Created POI: Cà Phê Phin Cò
✅ Database initialization completed!
```

## Bước 4: Test API

```powershell
# Test health check
Invoke-WebRequest -Uri http://localhost:5190/health -Method Get -UseBasicParsing

# Lấy danh sách POI
Invoke-WebRequest -Uri http://localhost:5190/api/pois -Method Get -UseBasicParsing | ConvertFrom-Json
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "ownerId": "demo_owner_001",
      "title": "Quán Cơm Chữ A",
      "categoryId": "cat_rice",
      "status": "approved",
      ...
    }
  ]
}
```

## ⚠️ Lưu ý

- **Chỉ chạy một lần**: `INIT_DB=1` sẽ không ghi đè dữ liệu hiện có (safe to re-run)
- **Thay đổi Project ID**: Nếu bạn muốn init cho project Firebase khác:
  ```powershell
  .\scripts\init-database.ps1 -ProjectId "your-other-project-id"
  ```
- **Xóa collections**: Để xóa dữ liệu, dùng Firebase Console → Firestore Database → Select collection → Delete
- **Tự động kích hoạt**: Có thể thiết lập env var `INIT_DB=1` trong `launchSettings.json` để tự động khởi tạo:
  ```json
  "environmentVariables": {
    "ASPNETCORE_ENVIRONMENT": "Development",
    "INIT_DB": "1"
  }
  ```

## 📚 Cấu trúc Collections

Xem chi tiết: [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)

Các collections được tạo:
- `categories` - Danh mục POI
- `pois` - Các điểm đến
- `admin_settings` - Cấu hình hệ thống

## 🛠️ Tiếp theo

1. Tạo thêm models cho: `User`, `Review`, `Bookmark`, `Menu`, `AuditLog`, `QRScan`
2. Tạo repositories tương ứng cho từng model
3. Implement Firebase Authentication middleware
4. Thêm category endpoints
5. Implement search, filter, nearby features với geospatial queries
