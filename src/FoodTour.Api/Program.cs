using FoodTour.Api.Middleware;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers();
// Register Firestore service and repositories
builder.Services.AddSingleton<FoodTour.Api.Services.FirestoreService>();
builder.Services.AddScoped<FoodTour.Api.Repositories.PoiRepository>();
builder.Services.AddScoped<FoodTour.Api.Repositories.CategoryRepository>();
builder.Services.AddScoped<FoodTour.Api.Services.DatabaseInitializerService>();
// CORS - allow local frontend during development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalDev", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Initialize database with default data (only if INIT_DB env var is set)
if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("INIT_DB")))
{
    Console.WriteLine("🚀 Database initialization requested...");
    using (var scope = app.Services.CreateScope())
    {
        var initializer = scope.ServiceProvider.GetRequiredService<FoodTour.Api.Services.DatabaseInitializerService>();
        await initializer.InitializeAsync();
    }
}

// Configure the HTTP request pipeline.
// Enable OpenAPI/Swagger in all environments for Day-1 convenience.
app.MapOpenApi();

// Enable CORS for mapped endpoints
app.UseCors("AllowLocalDev");

// Map attribute controllers
app.MapControllers();

// Register Firebase auth middleware (stub - implement verification in middleware).
app.UseFirebaseAuth();

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
