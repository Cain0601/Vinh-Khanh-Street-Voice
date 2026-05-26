# FoodTour

## Giới thiệu

`FoodTour` là một dự án mẫu gồm backend (.NET) và frontend (Next.js) phục vụ ứng dụng khám phá địa điểm ẩm thực. Dự án cung cấp API để quản lý POI (points of interest), danh mục, đánh giá, bookmark và các chức năng phân tích.

## Nội dung trong README

- Tổng quan dự án
- Hướng dẫn cài đặt và chạy (backend + frontend)
- Cấu trúc thư mục và mục đích các thư mục chính
- Tài liệu tham khảo nhanh

## Yêu cầu

- .NET 8+ SDK (hoặc tương thích với target framework trong `FoodTour.Api.csproj`)
- Node.js 18+ và pnpm hoặc npm cho frontend
- PowerShell (Windows) hoặc bash cho các script khởi tạo

## Cài đặt

1. Clone repo:

```bash
git clone <repo-url>
cd DoAn
```

2. Backend (API)

- Vào thư mục backend:

```bash
cd src/FoodTour.Api
```
- Cài đặt/restore các package và build:

```bash
dotnet restore
dotnet build
```
- Cấu hình: sao chép `appsettings.Firebase.json.example` nếu cần và chỉnh sửa các giá trị (ví dụ: Firebase, connection strings):

```powershell
cp appsettings.Firebase.json.example appsettings.Firebase.json
# chỉnh sửa appsettings.Firebase.json theo môi trường
```
- Khởi động API (Development):

```bash
dotnet run --project FoodTour.Api.csproj
```

3. Frontend (Web)

- Vào thư mục frontend:

```bash
cd web
```
- Cài dependencies và chạy dev server (sử dụng `pnpm` hoặc `npm`):

```bash
pnpm install
pnpm dev
# hoặc
npm install
npm run dev
```

## Chạy các script hỗ trợ

- Có các script PowerShell để khởi tạo dữ liệu / database trong `scripts/`:

```powershell
.
\scripts\init-database.ps1
.
\scripts\setup-day1.ps1
```

## Cấu trúc thư mục (tóm tắt)

- `docs/` - Tài liệu phụ trợ (database, checklist, tóm tắt triển khai,...).
- `infra/` - Cấu hình hạ tầng (ví dụ firestore.indexes.json).
- `plans/` - Các kế hoạch theo vai trò (admin/owner/user).
- `scripts/` - Script hỗ trợ cài đặt và khởi tạo (PowerShell).
- `src/` - Mã nguồn backend (.NET):
  - `FoodTour.Api/` - Project API chính:
    - `Controllers/` - Các controller (CategoryController, PoiController,...)
    - `Middleware/` - Middleware (ví dụ FirebaseAuthMiddleware)
    - `Models/` - Các model dữ liệu (Poi, User, Review,...)
    - `Repositories/` - Repository truy cập dữ liệu
    - `Services/` - Dịch vụ hỗ trợ (FirestoreService, DatabaseInitializerService,...)
- `web/` - Mã nguồn frontend (Next.js + Tailwind):
  - `src/` - Components, pages, hooks, store, lib,...
  - `public/` - Tài nguyên tĩnh
  - `README_FRONTEND.md`, `README_MOBILE_UI.md` - Hướng dẫn chi tiết cho frontend/mobile UI.

## Môi trường & cấu hình

- Các cấu hình backend nằm trong `src/FoodTour.Api/appsettings*.json` (ví dụ `appsettings.Development.json`, `appsettings.Firebase.json`).
- Thay đổi cấu hình Firebase/DB trước khi chạy nếu cần.

## Hướng dẫn sử dụng nhanh (API)

- Sau khi khởi động API, kiểm tra endpoint sức khỏe:

```
GET /health
```
- Sử dụng các endpoint trong `Controllers/` để quản lý POI, category, review, bookmark.

## Tài liệu thêm

- Xem thư mục `docs/` để biết chi tiết cấu trúc DB và checklist triển khai.
- Frontend: xem [web/README_FRONTEND.md](web/README_FRONTEND.md) để biết cách chạy và cấu hình frontend.

## Đóng góp

- Mở issue hoặc pull request mô tả chi tiết thay đổi.
- Tuân thủ code style hiện có và viết test khi thích hợp.

---
Nếu bạn muốn, tôi có thể thêm hướng dẫn môi trường chi tiết hơn (ví dụ cài Firebase, biến môi trường, hoặc lệnh Docker). Vui lòng cho biết bạn muốn thông tin nào tiếp theo.
