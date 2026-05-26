# Day 1 Checklist

## Backend Setup
- [x] Confirm Firebase project id and provide `service-account.json` for local dev (do not commit).
- [x] Ensure Cloud Firestore API is enabled in Firebase Console
  - Link: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=vinh-khanh-street-voice
- [ ] Run `scripts/setup-day1.ps1` to scaffold dependencies locally.
- [ ] Initialize Firestore database: `.\scripts\init-database.ps1`
- [ ] Start backend: `$env:GOOGLE_APPLICATION_CREDENTIALS='E:\VSCode\service_account.json'; dotnet run --project src\FoodTour.Api`
- [ ] Verify `GET /health` returns status OK
- [ ] Test Category API: `GET /api/categories`
- [ ] Test POI API: `GET /api/pois`

## Frontend Setup
- [ ] Start frontend: `npm run dev` in `web`
- [ ] Verify frontend is accessible on `http://localhost:3000`

## Firestore Collections
- [x] Design database schema (9 collections)
- [x] Create auto-initialization service
- [x] Implement Category CRUD
- [x] Implement POI CRUD with enhanced features
- [ ] Create User model & repository
- [ ] Create Review model & repository
- [ ] Create Menu model & repository
- [ ] Create Bookmark model & repository

## Deployment
- [ ] Add CI secrets (Docker Hub, Firebase service account) to repository settings when ready.

## Documentation
- [x] Database structure: [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)
- [x] Setup guide: [SETUP_DATABASE.md](./SETUP_DATABASE.md)
- [x] Implementation summary: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
