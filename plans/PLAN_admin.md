# Plan Admin

## Mục tiêu
Xây dựng lại phần **admin portal** cho Food Tour mới bằng **ASP.NET Core 8 + Firestore + Firebase Auth** và **Next.js frontend mới**, để quản trị user, role, category, moderation, audit logs và toàn bộ vận hành hệ thống trong một project mới độc lập.

## Nguyên tắc chung
- Admin là role cao nhất trong app.
- Project mới không phụ thuộc logic cũ ngoài dữ liệu cần migrate.
- Frontend admin được dựng lại theo route nhóm hiện có.
- Response envelope thống nhất: `{ success, message, data }`.

## Frontend cần dựng
### Stack đề xuất
- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Zustand
- Recharts
- Lucide React
- Dynamic import cho bảng, map, chart nặng

### Cấu trúc route frontend
- `app/(admin)/admin`
- `app/(admin)/admin/users`
- `app/(admin)/admin/categories`
- `app/(admin)/admin/pois`
- `app/(admin)/admin/audit-logs`
- `app/(admin)/admin/settings`
- `app/(admin)/admin/approvals`

### Thành phần frontend cần có
- `NotificationBell`
- shared `Card`, `Button`, `Badge`
- sidebar/header admin layout
- chart widgets, map widgets, table widgets

### State và dữ liệu
- `userStore` cho auth, role, token.
- `userAdminStore` cho user list / role changes.
- `categoryStore`, `poiStore`, `auditStore`, `settingsStore` cho dashboard data.
- API client phải unwrap `{ success, message, data }`.

## Phạm vi admin
### Chức năng chính
- Quản lý user: xem danh sách, chi tiết, đổi role, khóa/mở khóa.
- Quản lý moderation: duyệt/reject POI, duyệt yêu cầu nâng role.
- Quản lý category và translations.
- Xem audit logs.
- Xem analytics toàn hệ thống.
- Gắn cờ, ẩn, xóa mềm nội dung vi phạm.

### Không làm trong phase đầu
- Không làm billing, invoice, kế toán.
- Không làm super-admin multi-tenant.
- Không làm workflow phức tạp ngoài moderation và audit.
- Không làm permission engine quá trừu tượng ngay từ đầu.

## Kiến trúc mục tiêu
### Stack
- Backend: ASP.NET Core 8 Web API
- Data: Firestore
- Auth: Firebase Auth + admin claims
- Deploy: Cloud Run
- Logging: Cloud Logging / structured logs
- Frontend: Next.js + React + TypeScript rebuild mới theo admin pages hiện tại

### Module backend
- `AdminController`
- `ModerationController`
- `CategoryController`
- `AuditController`
- `AnalyticsController`
- `UserController`

## Domain dữ liệu
### Entities chính
- `User`
- `POI`
- `Category`
- `ModerationRequest`
- `AuditLog`
- `ListenEvent`
- `QrScanEvent`
- `LocationTrack`

### Admin-related fields
- `role`
- `requestedRole`
- `isActive`
- `deletedAt`
- `status`
- `oldValue`, `newValue`
- `action`, `targetId`, `ipAddress`, `userAgent`

## API admin cần có
### User management
- `GET /admin/users`
- `GET /admin/users/{id}`
- `PUT /admin/users/{id}/role`
- `PUT /admin/users/{id}/status`
- `DELETE /admin/users/{id}` (soft delete)

### Moderation
- `GET /admin/moderation/requests`
- `POST /admin/moderation/requests/{id}/approve`
- `POST /admin/moderation/requests/{id}/reject`
- `GET /admin/moderation/requests/{id}`

### Category management
- `GET /admin/categories`
- `POST /admin/categories`
- `PUT /admin/categories/{id}`
- `DELETE /admin/categories/{id}`

### Audit & analytics
- `GET /admin/audit-logs`
- `GET /admin/analytics/top-pois`
- `GET /admin/analytics/heatmap`
- `GET /admin/analytics/summary`

## Quy ước implementation
### Phân quyền
- Chỉ `ADMIN` vào được route admin.
- Middleware chặn toàn bộ route nếu role không hợp lệ.
- Hành động nhạy cảm phải ghi audit log.

### Audit policy
- Mọi thay đổi role, status, approve/reject phải tạo `AuditLog`.
- Lưu `before` và `after` state.
- Lưu metadata request nếu có.

### Moderation policy
- POI tạo mới có thể vào trạng thái `PENDING`.
- Admin approve/reject với reason rõ ràng.
- Role upgrade phải qua moderation request.

## Kế hoạch triển khai
### Phase 1: Khởi tạo admin core
- Tạo admin layout và route protection.
- Cấu hình auth guard và role claim.
- Tạo web shell mới bằng Next.js theo cấu trúc hiện tại.

### Phase 2: Dashboard + shell frontend
- Tạo KPI cards, charts, realtime map.
- Dựng sidebar/header, notification, tables.
- Kết nối dữ liệu tổng hợp từ backend mới.

### Phase 3: User & moderation
- CRUD quản trị user.
- Đổi role user/owner/admin.
- Khóa/mở khóa tài khoản.
- Duyệt POI và yêu cầu nâng role.

### Phase 4: Category & content governance
- CRUD category.
- Quản lý translations.
- Soft delete nội dung.
- Dựng form/modal/list/filter.

### Phase 5: Observability
- Dashboard analytics tổng hợp.
- Audit log search/filter.
- Theo dõi lỗi và cảnh báo.
- Kiểm tra responsive và accessibility.

## Cấu trúc file cần tạo
```text
Food-Tour-CSharp/
├─ web/
│  ├─ src/app/(admin)/...
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
- Admin đăng nhập và truy cập được admin portal.
- Admin quản lý user/role/migration/moderation đúng quyền.
- Audit log tạo ra cho các thao tác nhạy cảm.
- Category và analytics hoạt động ổn định.
- Frontend admin mới được dựng theo plan, không cần đọc lại codebase cũ để triển khai tiếp.