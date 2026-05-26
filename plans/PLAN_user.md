# Plan User

## Mục tiêu
Xây dựng lại toàn bộ **user experience** cho dự án Food Tour mới bằng **ASP.NET Core 8 + Firestore + Firebase Auth** và **Next.js frontend mới**, dùng codebase hiện tại làm tham chiếu để không phải đọc lại source cũ khi bắt đầu dự án mới.

## Nguyên tắc chung
- Backend mới là **project độc lập**.
- Frontend cũng được **rebuild** theo cấu trúc hiện tại, không copy nguyên trạng.
- Response envelope thống nhất: `{ success, message, data }`.
- Dữ liệu cũ từ PostgreSQL sẽ được ETL một lần sang Firestore.
- Auth dùng Firebase Authentication, backend chỉ xác thực token và gắn role/claims.

## Frontend cần dựng
### Stack đề xuất
- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Zustand
- Recharts
- Lucide React
- Google OAuth provider
- `lib/api.ts` làm fetch wrapper chung

### Cấu trúc route frontend
- `app/(auth)` cho login/register
- `app/(app)` cho user portal
- `app/(owner)` và `app/(admin)` chỉ xuất hiện khi role cho phép
- `app/layout.tsx` làm root layout + Providers + Toast

### Màn hình user cần làm mới
- `tour` / khám phá POI dạng mobile-first.
- `poi/[id]` / chi tiết POI.
- `profile` / thông tin cá nhân.
- `settings` / ngôn ngữ và tuỳ chọn.
- `onboarding` / hướng dẫn ban đầu.
- `login`, `register` / xác thực.

### Component và store cần có
- `Providers`, `Toast`, `BottomNav`, `RoleSwitcher`.
- `PlaceList`, `TourMap`, `PoiAudioDrawer`.
- `userStore`, `poiStore`, `settingsStore`, `categoryStore`.

### Yêu cầu hành vi
- Lưu token trong cookie, gắn vào request header.
- Giữ nguyên contract `{ success, message, data }`.
- Dynamic import cho map/audio component nặng.
- Có loading, empty, error state rõ ràng.

## Phạm vi user
### Chức năng chính
- Đăng ký, đăng nhập, đăng xuất, lấy hồ sơ cá nhân.
- Xem danh sách POI, tìm kiếm, lọc theo danh mục, vị trí, từ khóa.
- Xem chi tiết POI: mô tả, ảnh, menu, bản dịch, audio TTS.
- Lưu yêu thích / bookmark.
- Gửi đánh giá, phản hồi, report nếu cần.
- Nghe audio guide và quét QR để ghi nhận analytics.
- Hỗ trợ đa ngôn ngữ: `vi`, `en`, `ja`, `zh`.

### Không làm trong phase đầu
- Không làm realtime chat.
- Không làm thanh toán.
- Không làm offline/PWA phức tạp ngay từ đầu.
- Không tách frontend thành microfrontend.

## Kiến trúc mục tiêu
### Stack
- Backend: ASP.NET Core 8 Web API
- Data: Firestore
- Auth: Firebase Auth
- Storage: Firebase Storage hoặc Cloudinary
- TTS: Google TTS
- Deploy: Cloud Run
- Frontend: Next.js + React + TypeScript rebuild mới

### Module backend
- `AuthController`
- `PoiController`
- `CategoryController`
- `LocationController`
- `AnalyticsController`
- `MenuItemController`
- `UserController`
- `ModerationController` (nếu user request nâng cấp role)

## Domain dữ liệu
### Collections chính
- `users`
- `pois`
- `poi_translations`
- `categories`
- `menu_items`
- `bookmarks`
- `reviews`
- `location_tracks`
- `listen_events`
- `qr_scan_events`

### Trường dữ liệu cần giữ
- `id`, `createdAt`, `updatedAt`, `deletedAt`
- `role`, `language`, `isActive`, `isOnboarded`
- `status` cho POI và moderation
- `ownerId`, `categoryId`

## API user cần có
### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PUT /auth/profile`

### POI
- `GET /pois`
- `GET /pois/{id}`
- `GET /pois/search`
- `GET /pois/nearby`

### User actions
- `POST /bookmarks`
- `DELETE /bookmarks/{poiId}`
- `GET /bookmarks`
- `POST /reviews`
- `POST /analytics/listen`
- `POST /analytics/qr-scan`

## Quy ước implementation
### Tầng code
- Controller chỉ nhận request và trả response.
- Service giữ business logic.
- Repository chỉ làm việc với Firestore.
- DTO tách biệt khỏi domain model.

### Xác thực & phân quyền
- Middleware đọc Firebase token từ `Authorization: Bearer ...`.
- Role tối thiểu: `USER`.
- Dữ liệu riêng tư chỉ user tự xem/sửa được.

### Validation
- Dùng FluentValidation hoặc equivalent.
- Validate sớm ở DTO request.

## Kế hoạch triển khai
### Phase 1: Khởi tạo
- Tạo solution ASP.NET Core.
- Tạo web app Next.js mới theo route groups hiện tại.
- Tạo cấu trúc thư mục: `Controllers`, `Services`, `Repositories`, `Models`, `DTOs`, `Middleware`, `Config`, `Utilities`, `web/src/app`, `web/src/components`, `web/src/lib`, `web/src/store`.
- Cấu hình Firebase, Firestore, Swagger, logging.

### Phase 2: Auth + shell frontend
- Implement đăng ký/đăng nhập và token store.
- Dựng root layout, Providers, Toast, bottom nav.
- Implement profile và claims/role mapping.

### Phase 3: POI app core
- Implement list/detail/search/nearby.
- Dựng map, drawer audio, place list.
- Tích hợp translations, media và TTS.

### Phase 4: Tương tác user
- Bookmark, review, analytics tracking.
- Thêm caching cho endpoint đọc nhiều.
- Hoàn thiện onboarding, settings, locale switch.

### Phase 5: Migration
- Chuyển dữ liệu từ PostgreSQL sang Firestore.
- Test đối chiếu dữ liệu sample.
- Xác thực frontend mới gọi được API mới.

## Cấu trúc file cần tạo
```text
Food-Tour-CSharp/
├─ web/
│  ├─ src/app/(auth)/...
│  ├─ src/app/(app)/...
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
├─ appsettings.json
├─ appsettings.Production.json
└─ Dockerfile
```

## Tiêu chí hoàn thành
- User đăng ký/đăng nhập được bằng Firebase Auth.
- User xem được list/detail/search POI.
- Bookmark/review/analytics hoạt động.
- Frontend user mới chạy được theo route group và store hiện tại.
- Response format khớp với contract đã định.
