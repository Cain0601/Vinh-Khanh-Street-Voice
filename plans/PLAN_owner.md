# Plan Owner

## Mục tiêu
Xây dựng lại phần **owner portal** cho dự án Food Tour mới bằng **ASP.NET Core 8 + Firestore + Firebase Auth** và **Next.js frontend mới**, bám theo mô hình role-based access để owner quản lý POI, menu, media, QR và analytics mà không cần đọc lại codebase cũ.

## Nguyên tắc chung
- Backend mới là project riêng.
- User/Owner/Admin dùng chung một auth system.
- Frontend owner được dựng lại theo route-based layout hiện có.
- Response envelope thống nhất: `{ success, message, data }`.
- Owner chỉ thao tác trên tài nguyên thuộc quyền sở hữu.

## Frontend cần dựng
### Stack đề xuất
- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Zustand
- Recharts
- Lucide React
- Dynamic import cho map/chart nặng

### Cấu trúc route frontend
- `app/(owner)/owner`
- `app/(owner)/owner/dashboard`
- `app/(owner)/owner/poi`
- `app/(owner)/owner/menu`
- `app/(owner)/owner/media`
- `app/(owner)/owner/qr`
- `app/(owner)/owner/analytics`
- `app/(owner)/owner/settings`

### Thành phần frontend cần có
- `OwnerSidebar`
- `OwnerTopbar`
- `RoleSwitcher`
- `NotificationBell`
- shared `Card`, `Button`, `Badge`
- chart widgets và map widgets riêng cho owner

### State và dữ liệu
- `userStore` giữ token, role, language.
- `poiStore` giữ CRUD POI và upload media.
- `categoryStore` cho filter và select.
- `auditStore` nếu cần lịch sử thao tác.
- API client phải unwrap `{ success, message, data }`.

## Phạm vi owner
### Chức năng chính
- Dashboard tổng quan: số POI, lượt nghe, lượt scan, trạng thái duyệt.
- Tạo/sửa/xóa POI thuộc quyền sở hữu.
- Quản lý menu items cho từng POI.
- Upload media (ảnh, audio) cho POI.
- Xem QR code / thống kê scan.
- Xem analytics riêng của owner.
- Gửi yêu cầu nâng cấp / thay đổi thông tin nếu cần.

### Không làm trong phase đầu
- Không cho owner duyệt toàn hệ thống.
- Không cho owner chỉnh user system-wide.
- Không làm payment, subscription, commission.
- Không làm editor kéo-thả phức tạp ngay từ đầu.

## Kiến trúc mục tiêu
### Stack
- Backend: ASP.NET Core 8 Web API
- Data: Firestore
- Auth: Firebase Auth + custom role claims
- Media: Cloudinary hoặc Firebase Storage
- TTS: Google TTS
- Deploy: Cloud Run
- Frontend: Next.js + React + TypeScript rebuild mới theo owner pages hiện tại

### Module backend
- `OwnerController` hoặc nhóm controller theo chức năng
- `PoiController`
- `MenuItemController`
- `MediaController`
- `AnalyticsController`
- `QrController`
- `ModerationController` (nếu owner submit request)

## Domain dữ liệu
### Entities chính
- `User`
- `POI`
- `POITranslation`
- `Category`
- `MenuItem`
- `OwnerDashboardSnapshot`
- `QrCodeRecord`
- `ListenEvent`
- `ModerationRequest`

### Owner-specific fields
- `ownerId`
- `approvalStatus`
- `submittedAt`
- `approvedAt`
- `rejectedAt`
- `rejectionReason`
- `mediaUrls`

## API owner cần có
### Dashboard
- `GET /owner/dashboard`
- `GET /owner/analytics`
- `GET /owner/summary`

### POI management
- `GET /owner/pois`
- `POST /owner/pois`
- `GET /owner/pois/{id}`
- `PUT /owner/pois/{id}`
- `DELETE /owner/pois/{id}`

### Menu management
- `GET /owner/menu-items`
- `POST /owner/pois/{poiId}/menu-items`
- `PUT /owner/menu-items/{id}`
- `DELETE /owner/menu-items/{id}`

### Media & QR
- `POST /owner/pois/{poiId}/media`
- `DELETE /owner/media/{mediaId}`
- `GET /owner/pois/{poiId}/qr`
- `GET /owner/pois/{poiId}/qr/stats`

## Quy ước implementation
### Phân quyền
- `OWNER` và `ADMIN` có thể vào owner portal.
- `USER` không được truy cập các route owner.
- Middleware kiểm tra `role` trong token.

### Data access
- Repository phải lọc theo `ownerId`.
- Không join; dùng denormalized data khi cần hiển thị dashboard nhanh.
- Soft delete cho POI/menu/media.

### Validation
- Validate ownership trước khi update/delete.
- Validate media type, size, và mime type.

## Kế hoạch triển khai
### Phase 1: Khởi tạo owner module
- Tạo owner layout, sidebar, topbar.
- Tạo route protection cho owner/admin.
- Tạo web shell mới bằng Next.js theo cấu trúc hiện tại.

### Phase 2: POI CRUD + shell frontend
- Tạo/sửa/xóa POI.
- Lưu status và workflow duyệt.
- Dựng form, bảng, modal và trang danh sách.

### Phase 3: Menu & media
- CRUD menu items.
- Upload ảnh/audio.
- Lưu media references và cleanup.
- Dựng upload UI và preview UI.

### Phase 4: QR & analytics
- Sinh QR record cho POI.
- Đếm scan và listen.
- Hiển thị dashboard metrics.
- Dựng chart, map và card widgets.

### Phase 5: Ổn định và migration
- Đồng bộ dữ liệu owner từ hệ cũ sang Firestore.
- Test quyền truy cập và hành vi route.
- Kiểm tra responsive, loading và error states.

## Cấu trúc file cần tạo
```text
Food-Tour-CSharp/
├─ web/
│  ├─ src/app/(owner)/...
│  ├─ src/components/...
│  ├─ src/lib/...
│  └─ src/store/...
├─ src/
│  ├─ Controllers/
│  ├─ Services/
│  ├─ Repositories/
│  ├─ Models/
│  ├─ DTOs/
│  ├─ Middleware/
│  ├─ Utilities/
│  └─ Program.cs
├─ tests/
└─ Dockerfile
```

## Tiêu chí hoàn thành
- Owner đăng nhập và vào được owner portal.
- Owner tạo/sửa/xóa POI của mình.
- Menu, media, QR, analytics chạy đúng.
- Admin vẫn có thể truy cập owner scope nếu cần.
- UI owner mới được dựng từ plan, không cần đọc lại code cũ để triển khai tiếp.
