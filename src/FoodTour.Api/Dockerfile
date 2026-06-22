FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Cài thêm dependencies cho Piper (âm thanh)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "FoodTour.Api.csproj"
RUN dotnet publish "FoodTour.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

# Tạo thư mục piper_tts
RUN mkdir -p /app/piper_tts/models \
    && mkdir -p /app/piper_tts/piper

ENTRYPOINT ["dotnet", "FoodTour.Api.dll"]