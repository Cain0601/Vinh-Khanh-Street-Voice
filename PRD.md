# PRD — VinhKhanh Food Tour

## 1. Tổng quan
VinhKhanh Food Tour là ứng dụng web giúp người dùng khám phá ẩm thực đường phố, xem điểm đến (POI), nghe audio guide, quét QR và lưu lại trải nghiệm. Sản phẩm có 3 vai trò: `USER`, `OWNER`, `ADMIN`.

## 2. Bối cảnh mới
Dự án hiện được định hướng viết lại theo stack mới:
- Backend: `ASP.NET Core 8` / C#
- Auth: `Firebase Authentication`
- Database: `Firestore`
- Media: `Firebase Storage` hoặc `Cloudinary`
- Frontend: `Next.js` + `React` + `TypeScript`

Mục tiêu là tách khỏi nền tảng Node.js/Prisma/PostgreSQL hiện tại để có kiến trúc mới dễ mở rộng và phù hợp với hạ tầng Firebase.

## 3. Mục tiêu sản phẩm
- Giúp người dùng tìm và trải nghiệm food tour nhanh, trực quan
- Cho owner tự quản lý POI, menu, media và thống kê
- Cho admin kiểm soát user, moderation, category, audit logs
- Giữ trải nghiệm nhất quán giữa user app, owner portal và admin portal
- Đảm bảo kiến trúc mới dễ bảo trì, dễ deploy, dễ mở rộng

## 4. Persona
### USER
- Khách tham quan, người muốn khám phá địa điểm ăn uống
- Cần tìm POI theo vị trí, danh mục, ngôn ngữ

### OWNER
- Chủ địa điểm hoặc người quản lý POI
- Cần CRUD POI, menu, media, QR, xem analytics

### ADMIN
- Quản trị hệ thống
- Cần quản lý user, role, nội dung, moderation, audit

## 5. Vấn đề cần giải quyết
- Người dùng khó tìm địa điểm phù hợp nhanh và theo ngữ cảnh
- Nội dung POI cần nhiều ngôn ngữ và audio hỗ trợ
- Owner cần dashboard để tự cập nhật nội dung
- Admin cần công cụ kiểm duyệt và theo dõi hệ thống
- Kiến trúc cũ cần được thay thế bằng nền tảng phù hợp hơn với Firebase

## 6. Phạm vi sản phẩm
### Trong phạm vi
- Đăng ký, đăng nhập, đăng xuất, hồ sơ cá nhân
- Xem danh sách POI, chi tiết POI, tìm kiếm, lọc, nearby
- Bản đồ, QR scan, audio guide, bookmark
- Quản lý POI/menu/media cho owner
- Quản lý user/category/moderation/audit cho admin
- Thống kê và analytics cơ bản
- Đa ngôn ngữ và responsive UI

### Ngoài phạm vi trước mắt
- Thanh toán / booking
- Realtime chat
- Offline-first / PWA nâng cao
- Multi-tenant phức tạp

## 7. Chức năng chính
### USER
- Tạo tài khoản, đăng nhập, đăng xuất
- Xem tour / POI gần mình
- Xem chi tiết POI, menu, ảnh, mô tả, bản dịch
- Nghe audio guide
- Quét QR để ghi nhận lượt xem / nghe
- Lưu yêu thích, đánh giá, phản hồi
- Đổi ngôn ngữ giao diện

### OWNER
- Xem dashboard tổng quan
- Tạo, sửa, xóa POI của mình
- Quản lý menu items
- Upload ảnh / audio
- Xem QR code và thống kê scan
- Xem analytics theo địa điểm

### ADMIN
- Quản lý user và role
- Duyệt / từ chối POI hoặc yêu cầu nâng quyền
- Quản lý category và translation
- Xem audit logs
- Xem thống kê toàn hệ thống

## 8. Yêu cầu chức năng
- Phân quyền theo `USER`, `OWNER`, `ADMIN`
- Dữ liệu POI phải hỗ trợ đa ngôn ngữ
- API phải trả về format thống nhất
- Mọi thay đổi nhạy cảm phải được ghi nhận audit log
- Các trang quản trị phải chặn truy cập trái phép
- Upload media phải kiểm tra loại file và kích thước
- Backend C# phải xác thực token Firebase trước khi cho phép truy cập

## 9. Yêu cầu phi chức năng
- UI responsive trên mobile, tablet, desktop
- Tốc độ tải trang và truy vấn phải tốt với dữ liệu POI lớn
- Bảo mật auth, token, phân quyền và upload
- Codebase dễ bảo trì, chia lớp rõ ràng
- Quan sát được lỗi và hành vi hệ thống qua logging / analytics
- Hệ thống deploy được lên Cloud Run hoặc hạ tầng container tương đương

## 10. Công nghệ mục tiêu
### Backend
- `ASP.NET Core 8` / C#
- `Firebase Authentication`
- `Firestore`
- `Firebase Storage` hoặc `Cloudinary`
- `Google Cloud Logging`
- `Swagger / OpenAPI`

### Frontend
- `Next.js`
- `React`
- `TypeScript`
- `Zustand`
- `Leaflet` / `react-leaflet`
- `Recharts`
- `Lucide React`

## 11. Mô hình dữ liệu chính
### Collections / Entities
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
- `audit_logs`
- `moderation_requests`

### Trường dữ liệu quan trọng
- `id`, `createdAt`, `updatedAt`, `deletedAt`
- `role`, `language`, `isActive`, `isOnboarded`
- `status` cho POI và moderation
- `ownerId`, `categoryId`
- `ipAddress`, `userAgent` cho audit

## 12. Kiến trúc sản phẩm
### Backend structure
- Controller chỉ nhận request và trả response
- Service giữ business logic
- Repository làm việc với Firestore
- DTO tách biệt khỏi domain model
- Middleware xử lý auth, role và lỗi

### Frontend structure
- `app/(auth)` cho login/register
- `app/(app)` cho user portal
- `app/(owner)` cho owner portal
- `app/(admin)` cho admin portal
- Shared API client dùng chung envelope `{ success, message, data }`

## 13. Luồng người dùng chính
### USER journey
1. Mở app
2. Đăng nhập hoặc dùng trải nghiệm công khai
3. Tìm POI theo bản đồ / danh mục / từ khóa
4. Xem chi tiết, nghe audio, quét QR
5. Bookmark hoặc đánh giá

### OWNER journey
1. Đăng nhập bằng Firebase Auth
2. Vào owner portal
3. Quản lý POI, menu, media
4. Xem analytics và QR stats

### ADMIN journey
1. Đăng nhập bằng Firebase Auth
2. Vào admin portal
3. Quản lý user, category, moderation
4. Theo dõi audit logs và thống kê

## 14. Tiêu chí thành công
- User tìm được POI nhanh hơn và tương tác nhiều hơn
- Owner cập nhật nội dung không cần hỗ trợ kỹ thuật
- Admin xử lý moderation và user management nhanh hơn
- Hệ thống ổn định, ít lỗi truy cập sai quyền
- Backend mới chạy ổn định trên Firebase-oriented architecture

## 15. Rủi ro chính
- Dữ liệu POI thiếu đồng nhất hoặc thiếu bản dịch
- Tăng chi phí truy vấn nếu không tối ưu Firestore/index
- Quyền truy cập giữa 3 vai trò dễ lệch nếu không chuẩn hóa
- Media và analytics có thể làm phức tạp kiến trúc frontend
- Migration từ PostgreSQL sang Firestore có thể phát sinh sai khác dữ liệu

## 16. Định hướng tiếp theo
- Chuẩn hóa API contract và response envelope
- Làm lại frontend theo route groups rõ ràng
- Xây dựng backend C# + Firebase theo lớp rõ ràng
- Tối ưu Firestore schema và indexing
- Tăng khả năng mở rộng cho đa ngôn ngữ và analytics
