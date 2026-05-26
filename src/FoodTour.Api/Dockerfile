FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/FoodTour.Api/FoodTour.Api.csproj", "src/FoodTour.Api/"]
RUN dotnet restore "src/FoodTour.Api/FoodTour.Api.csproj"
COPY . .
WORKDIR "/src/src/FoodTour.Api"
RUN dotnet publish "FoodTour.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "FoodTour.Api.dll"]
