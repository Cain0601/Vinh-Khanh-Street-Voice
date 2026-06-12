using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Cloud.Firestore;
using FoodTour.Api.DTOs;
using System.Text.Json;

namespace FoodTour.Api.Middleware
{
    public class FirebaseAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<FirebaseAuthMiddleware> _logger;

        // Paths that skip authentication
        private static readonly string[] PublicPaths = new[]
        {
            "/health",
            "/swagger",
            "/openapi",
            "/weatherforecast",
            "/api/pois",        // Public read for POIs
            "/api/categories"   // Public read for categories
        };

        // Paths that always require auth
        private static readonly string[] AuthRequiredPrefixes = new[]
        {
            "/auth/me",
            "/auth/profile",
            "/owner/",
            "/admin/",
            "/bookmarks",
            "/reviews",
            "/analytics/"
        };

        public FirebaseAuthMiddleware(RequestDelegate next, ILogger<FirebaseAuthMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";
            var method = context.Request.Method;

            // Allow public GET endpoints without auth
            if (IsPublicEndpoint(path, method))
            {
                await _next(context);
                return;
            }

            // Auth endpoints (login/register) don't need prior auth
            if (path.StartsWith("/auth/login") || path.StartsWith("/auth/register"))
            {
                await _next(context);
                return;
            }

            // Extract Bearer token
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                await WriteUnauthorized(context, "Missing or invalid authorization header.");
                return;
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();

            try
            {
                // Verify Firebase ID token
                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
                
                context.Items["FirebaseUid"] = decodedToken.Uid;
                context.Items["FirebaseEmail"] = decodedToken.Claims.TryGetValue("email", out var email) ? email?.ToString() : "";
                context.Items["FirebaseName"] = decodedToken.Claims.TryGetValue("name", out var name) ? name?.ToString() : "";

                // Look up user in Firestore to get role
                var firestoreService = context.RequestServices.GetRequiredService<Services.FirestoreService>();
                var db = firestoreService.Db;

                var usersRef = db.Collection("users");
                var query = usersRef.WhereEqualTo("email", context.Items["FirebaseEmail"]?.ToString() ?? "").Limit(1);
                var snapshot = await query.GetSnapshotAsync();

                if (snapshot.Documents.Count > 0)
                {
                    var userDoc = snapshot.Documents[0];
                    var userData = userDoc.ConvertTo<Models.User>();
                    userData.Id = userDoc.Id;

                    if (!userData.IsActive)
                    {
                        await WriteForbidden(context, "Account is deactivated.");
                        return;
                    }

                    context.Items["UserId"] = userData.Id;
                    context.Items["UserRole"] = userData.Role;
                    context.Items["UserData"] = userData;
                }
                else
                {
                    // User exists in Firebase but not in Firestore yet
                    // Allow access but with no role (auth/register will create the user)
                    context.Items["UserId"] = "";
                    context.Items["UserRole"] = "USER";
                }

                // Check role-based access
                var userRole = context.Items["UserRole"]?.ToString() ?? "USER";

                // Admin routes require ADMIN role
                if (path.StartsWith("/admin/") && userRole != "ADMIN")
                {
                    await WriteForbidden(context, "Admin access required.");
                    return;
                }

                // Owner routes require OWNER or ADMIN role
                if (path.StartsWith("/owner/") && userRole != "OWNER" && userRole != "ADMIN")
                {
                    await WriteForbidden(context, "Owner access required.");
                    return;
                }

                await _next(context);
            }
            catch (FirebaseAuthException ex)
            {
                _logger.LogWarning(ex, "Firebase token verification failed");
                await WriteUnauthorized(context, "Invalid or expired token.");
            }
        }

        private bool IsPublicEndpoint(string path, string method)
        {
            // Health, swagger, openapi are always public
            if (path == "/health" || path.StartsWith("/swagger") || path.StartsWith("/openapi"))
                return true;

            // GET requests to public POI/category endpoints
            if (method == "GET")
            {
                if (path.StartsWith("/api/pois") || path.StartsWith("/api/categories"))
                    return true;
            }

            return false;
        }

        private static async Task WriteUnauthorized(HttpContext context, string message)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            var response = ApiResponse.Fail(message);
            await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }));
        }

        private static async Task WriteForbidden(HttpContext context, string message)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            var response = ApiResponse.Fail(message);
            await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }));
        }
    }

    public static class FirebaseAuthExtensions
    {
        public static IApplicationBuilder UseFirebaseAuth(this IApplicationBuilder app)
        {
            return app.UseMiddleware<FirebaseAuthMiddleware>();
        }
    }
}
