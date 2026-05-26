# Initialize Firestore Database with Sample Data
# Usage: .\init-database.ps1

param(
    [switch]$SkipDataCreation = $false,
    [string]$ProjectId = "vinh-khanh-street-voice",
    [string]$ServiceAccountPath = "E:\VSCode\service_account.json"
)

Write-Host "🚀 FoodTour Database Initialization Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Validate service account
if (-not (Test-Path $ServiceAccountPath)) {
    Write-Host "❌ Service account file not found at: $ServiceAccountPath" -ForegroundColor Red
    Write-Host "Please set GOOGLE_APPLICATION_CREDENTIALS correctly." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Service account file found" -ForegroundColor Green

# Set environment variables
$env:GOOGLE_APPLICATION_CREDENTIALS = $ServiceAccountPath
$env:FIREBASE_PROJECT_ID = $ProjectId
$env:INIT_DB = "1"  # Trigger database initialization

Write-Host "📝 Environment variables set:" -ForegroundColor Cyan
Write-Host "  - FIREBASE_PROJECT_ID: $ProjectId" -ForegroundColor Gray
Write-Host "  - GOOGLE_APPLICATION_CREDENTIALS: $ServiceAccountPath" -ForegroundColor Gray
Write-Host "  - INIT_DB: 1" -ForegroundColor Gray
Write-Host ""

# Run backend with initialization
Write-Host "🔄 Starting backend API with database initialization..." -ForegroundColor Cyan
Write-Host ""

# Resolve repository root (scripts folder is inside repo root)
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$ProjectPath = Join-Path $RepoRoot "src\FoodTour.Api"

if (-not (Test-Path $ProjectPath)) {
    Write-Host "❌ Backend project not found at: $ProjectPath" -ForegroundColor Red
    Write-Host "Checked repository root: $RepoRoot" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting: dotnet run --project $ProjectPath --urls http://localhost:5190" -ForegroundColor Gray
Write-Host ""

# Run the backend
& dotnet run --project $ProjectPath --urls http://localhost:5190

Write-Host ""
Write-Host "✅ Initialization complete!" -ForegroundColor Green
Write-Host "Backend is running on: http://localhost:5190" -ForegroundColor Yellow
