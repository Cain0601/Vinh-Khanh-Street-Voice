using FoodTour.Api.Middleware;
using FoodTour.Api.Repositories;
using FoodTour.Api.Services;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

// ─────────────────── Services ───────────────────

builder.Services.AddOpenApi();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Firebase Admin SDK initialization
if (FirebaseApp.DefaultInstance == null)
{
    try
    {
        FirebaseApp.Create(new AppOptions
        {
            Credential = GoogleCredential.GetApplicationDefault()
        });
    }
    catch
    {
        Console.WriteLine("⚠️  Firebase Admin SDK not initialized — set GOOGLE_APPLICATION_CREDENTIALS env var.");
    }
}

// Firestore
builder.Services.AddSingleton<FirestoreService>();

// Repositories
builder.Services.AddScoped<PoiRepository>();
builder.Services.AddScoped<CategoryRepository>();
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<ReviewRepository>();
builder.Services.AddScoped<BookmarkRepository>();
builder.Services.AddScoped<MenuItemRepository>();
builder.Services.AddScoped<AnalyticsRepository>();
builder.Services.AddScoped<AuditRepository>();
builder.Services.AddScoped<ModerationRepository>();

// Database initializer
builder.Services.AddScoped<DatabaseInitializerService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalDev", policy =>
    {
        // Load allowed origins from environment variable (comma‑separated).
        // Fallback to localhost URLs if variable is not set.
        var origins = (builder.Configuration["ALLOWED_ORIGINS"] ?? "http://localhost:3000,http://localhost:3001")
            .Split(',', System.StringSplitOptions.RemoveEmptyEntries)
            .Select(o => o.Trim())
            .Append("https://vinh-khanh-street-voice.onrender.com")
            .ToArray();

        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// ─────────────────── Pipeline ───────────────────

// 1. Global exception handler (outermost — catches everything)
app.UseGlobalExceptionHandler();

// 2. CORS
app.UseCors("AllowLocalDev");

// 3. Firebase auth middleware (before routing/controllers)
app.UseFirebaseAuth();

// 4. Routing + Controllers
app.UseRouting();
app.MapControllers();

// 5. Swagger (all environments for convenience)
app.MapOpenApi();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "VinhKhanh Food Tour API v1");
    c.RoutePrefix = "swagger";
});

// 6. Health check
app.MapGet("/health", () => Results.Ok(new { status = "ok", time = DateTime.UtcNow }));

// ─────────────────── DB Init ───────────────────

if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("INIT_DB")))
{
    Console.WriteLine("🚀 Database initialization requested...");
    using var scope = app.Services.CreateScope();
    var initializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializerService>();
    await initializer.InitializeAsync();
}

app.Run();
