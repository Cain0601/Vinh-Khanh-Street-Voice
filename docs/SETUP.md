# Setup — Food Tour (Day 1)

This document explains how to run the backend and frontend locally for Day‑1.

Prerequisites
- .NET SDK (10.0)
- Node.js (16+ recommended)
- npm
- Optional: Docker for container builds

Backend (ASP.NET Core)
```powershell
# from repository root
cd src/FoodTour.Api
dotnet restore
dotnet build
dotnet run --urls "http://localhost:5000"
```
- Swagger: http://localhost:5000/swagger

Frontend (Next.js)
```bash
cd web
npm install
npm run dev
```
- App: http://localhost:3000

Secrets and Firebase
- Place server service account JSON outside the repo and point to it via environment variable `GOOGLE_APPLICATION_CREDENTIALS` for local dev.
- Copy `web/.env.local.example` to `web/.env.local` and fill values.

Notes
- Do NOT commit any service-account.json or secret files.
