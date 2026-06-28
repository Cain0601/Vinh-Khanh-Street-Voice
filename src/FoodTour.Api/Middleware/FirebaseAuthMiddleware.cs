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
            "/setup",           // Dev-only setup endpoints
            "/api/pois",        // Public read for POIs
            "/api/categories",  // Public read for categories
            "/hubs/"            // SignalR hubs — allow anonymous connection, roles handled inside hub
        };

        // Paths that always require auth — checked BEFORE PublicPaths
        private static readonly string[] AuthRequiredPrefixes = new[]
        {
            "/auth/me",
            "/auth/profile",
            "/owner/",
            "/owners/",          // /owners/dashboard, /owners/analytics
            "/admin/",
            "/bookmarks",
            "/reviews",
            "/analytics/",
            "/menu-items/",      // /menu-items/owner/list, PUT/DELETE /menu-items/{id}
            "/pois/owner",       // /pois/owner/list
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

            // // Development shortcut: allow bypassing Firebase auth for local testing.
            // // Send header `X-Dev-Bypass: owner` to impersonate an OWNER during development only.
            // var isDevEnv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";
            // var isDevMock = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DEV_FIRESTORE_MOCK"))
            //                 && Environment.GetEnvironmentVariable("DEV_FIRESTORE_MOCK") == "true";

            // if (isDevEnv || isDevMock)
            // {
            //     if (context.Request.Headers.TryGetValue("X-Dev-Bypass", out var bypass) && bypass == "owner")
            //     {
            //         context.Items["UserId"] = "dev-owner";
            //         context.Items["UserRole"] = "OWNER";
            //         context.Items["UserData"] = new Models.User { Id = "dev-owner", Role = "OWNER", IsActive = true, FullName = "Dev Owner" };
            //         await _next(context);
            //         return;
            //     }
            // }

            // SignalR hubs: allow anonymous but still try to resolve user identity from token
            if (path.StartsWith("/hubs/"))
            {
                await TryResolveHubIdentityAsync(context);
                await _next(context);
                return;
            }

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
            var token = string.Empty;

            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                token = authHeader.Substring("Bearer ".Length).Trim();
            }
            else if (path.StartsWith("/hubs/") && context.Request.Query.TryGetValue("access_token", out var accessToken))
            {
                // SignalR sends token in query string
                token = accessToken.ToString();
            }

            if (string.IsNullOrEmpty(token))
            {
                await WriteUnauthorized(context, "Missing or invalid authorization token.");
                return;
            }

            // // If Firebase Admin SDK is not initialized (missing service_account.json),
            // // fall back to dev-owner in Development; block in Production.
            // if (FirebaseApp.DefaultInstance == null)
            // {
            //     if (isDevEnv)
            //     {
            //         _logger.LogWarning("Firebase Admin SDK not initialized — auto-bypassing auth in Development mode.");
            //         context.Items["UserId"]   = "dev-owner";
            //         context.Items["UserRole"] = "OWNER";
            //         context.Items["UserData"] = new Models.User { Id = "dev-owner", Role = "OWNER", IsActive = true, FullName = "Dev Owner (no creds)" };
            //         await _next(context);
            //         return;
            //     }
            //     await WriteUnauthorized(context, "Authentication service unavailable. Set GOOGLE_APPLICATION_CREDENTIALS on the server.");
            //     return;
            // }

            try
            {
                // Verify Firebase ID token
                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
                
                context.Items["FirebaseUid"] = decodedToken.Uid;
                context.Items["FirebaseEmail"] = decodedToken.Claims.TryGetValue("email", out var email) ? email?.ToString() : "";
                context.Items["FirebaseName"] = decodedToken.Claims.TryGetValue("name", out var name) ? name?.ToString() : "";

                // Look up user in Firestore to get role
                try
                {
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

                        context.Items["UserId"]   = userData.Id;
                        context.Items["UserRole"] = userData.Role;
                        context.Items["UserData"] = userData;
                    }
                    else
                    {
                        context.Items["UserId"]   = decodedToken.Uid;
                        context.Items["UserRole"] = "USER";
                    }
                }
                catch (Exception fsEx)
                {
                    // Firestore unavailable — set uid from Firebase token, allow request through
                    _logger.LogWarning(fsEx, "Firestore lookup failed — using Firebase UID as UserId");
                    context.Items["UserId"]   = decodedToken.Uid;
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

        /// <summary>
        /// For SignalR hubs: attempt to resolve user identity from Bearer or query-string token.
        /// Does NOT block the request if no token is present (anonymous is allowed).
        /// </summary>
        private async Task TryResolveHubIdentityAsync(HttpContext context)
        {
            var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            var token = string.Empty;

            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
            {
                token = authHeader.Substring("Bearer ".Length).Trim();
            }
            else if (context.Request.Query.TryGetValue("access_token", out var accessToken))
            {
                token = accessToken.ToString();
            }

            if (string.IsNullOrEmpty(token)) return; // anonymous — do nothing

            try
            {
                var decodedToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);

                var firestoreService = context.RequestServices.GetRequiredService<Services.FirestoreService>();
                var db = firestoreService.Db;
                var email = decodedToken.Claims.TryGetValue("email", out var em) ? em?.ToString() : "";
                if (!string.IsNullOrEmpty(email))
                {
                    var snapshot = await db.Collection("users").WhereEqualTo("email", email).Limit(1).GetSnapshotAsync();
                    if (snapshot.Documents.Count > 0)
                    {
                        var userDoc = snapshot.Documents[0];
                        var userData = userDoc.ConvertTo<Models.User>();
                        userData.Id = userDoc.Id;
                        context.Items["UserId"]   = userData.Id;
                        context.Items["UserRole"] = userData.Role;
                        context.Items["UserData"] = userData;
                    }
                    else
                    {
                        context.Items["UserId"]   = decodedToken.Uid;
                        context.Items["UserRole"] = "USER";
                    }
                }
            }
            catch
            {
                // Invalid/expired token — treat as anonymous, don't block
            }
        }

        private bool IsPublicEndpoint(string path, string method)
        {
            // Health, swagger, openapi are always public
            if (path == "/health" || path.StartsWith("/swagger") || path.StartsWith("/openapi"))
                return true;

            // SignalR hubs — allow all connections; roles resolved inside the hub
            if (path.StartsWith("/hubs/"))
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
