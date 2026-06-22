@echo off
set DEV_FIRESTORE_MOCK=true
set ASPNETCORE_ENVIRONMENT=Development
dotnet run --no-launch-profile > runlog.txt 2>&1
