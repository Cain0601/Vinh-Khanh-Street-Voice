using FoodTour.Api.Middleware;
using FoodTour.Api.Repositories;
using FoodTour.Api.Services;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using System.Linq;

var builder = WebApplication.CreateBuilder(args);

// Dev mock flag for Firestore and Firebase behaviors
var useDevMock = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DEV_FIRESTORE_MOCK"))
                 && Environment.GetEnvironmentVariable("DEV_FIRESTORE_MOCK") == "true";

// Warn early if credential file is missing (server still starts; data endpoints return 500 until fixed)
{
    var credPath = Environment.GetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS");
    if (string.IsNullOrEmpty(credPath))
    {
        Console.WriteLine("⚠️  GOOGLE_APPLICATION_CREDENTIALS is not set.");
        Console.WriteLine("⚠️  Place service_account.json in the FoodTour.Api folder and set the env var.");
        Console.WriteLine("⚠️  Or set DEV_FIRESTORE_MOCK=true to skip Firestore entirely.");
    }
    else if (!File.Exists(credPath))
    {
        Console.WriteLine($"⚠️  Credential file not found: {credPath}");
        Console.WriteLine($"⚠️  Copy your service_account.json to that location, or to the project folder");
        Console.WriteLine($"⚠️  and update GOOGLE_APPLICATION_CREDENTIALS in launchSettings.json.");
        Console.WriteLine($"⚠️  Or set DEV_FIRESTORE_MOCK=true to skip Firestore entirely.");
    }
    else
    {
        Console.WriteLine($"✅ Credential file found: {credPath}");
    }
}

// ─────────────────── Services ───────────────────

builder.Services.AddHttpClient();
builder.Services.AddSingleton<TranslationService>();
builder.Services.AddSingleton<PiperTtsService>();
builder.Services.AddSingleton<CloudinaryService>();

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

// Firebase Admin SDK initialization (skip in dev mock)
if (!useDevMock)
{
    if (FirebaseApp.DefaultInstance == null)
    {
        try
        {
            FirebaseApp.Create(new AppOptions
            {
                Credential = GoogleCredential.GetApplicationDefault()
            });
            Console.WriteLine("✅ Firebase Admin SDK initialized.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️  Firebase Admin SDK init failed: {ex.Message}");
            Console.WriteLine("⚠️  Falling back to dev-mock mode.");
            useDevMock = true;
        }
    }
}

// Firestore — always register so Repositories can resolve it.
// FirestoreService will hold a null Db when credentials are missing;
// repositories return empty results in that case.
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
        var origins = (builder.Configuration["ALLOWED_ORIGINS"] ?? "http://localhost:3000,http://localhost:3001,http://192.168.1.121")
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

// 6. (Health handled by HealthController at GET /health)

// ─────────────────── DB Init ───────────────────

if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("INIT_DB")))
{
    Console.WriteLine("🚀 Database initialization requested...");
    using var scope = app.Services.CreateScope();
    var initializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializerService>();
    await initializer.InitializeAsync();
}

app.Run();
