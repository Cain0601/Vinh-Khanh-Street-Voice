# PowerShell script to run Day-1 local scaffolding and installs
# Run from repository root

Write-Host "Restoring and building backend..."
cd src/FoodTour.Api
dotnet restore
dotnet build

Write-Host "Installing frontend deps..."
cd ..\..
cd web
npm install

Write-Host "Done. Start backend with: dotnet run (in src/FoodTour.Api)"
Write-Host "Start frontend with: npm run dev (in web)"
