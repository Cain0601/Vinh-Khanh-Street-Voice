FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
	WORKDIR /src
	# Copy the project files into the container
	COPY . .
	# Restore dependencies and publish the application
	RUN dotnet restore "FoodTour.Api.csproj"
	RUN dotnet publish "FoodTour.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "FoodTour.Api.dll"]
