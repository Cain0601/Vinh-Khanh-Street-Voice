using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace FoodTour.Api.Middleware
{
    public class FirebaseAuthMiddleware
    {
        private readonly RequestDelegate _next;
        public FirebaseAuthMiddleware(RequestDelegate next) => _next = next;

        public async Task InvokeAsync(HttpContext context)
        {
            // TODO: Validate Firebase JWT from Authorization header using FirebaseAdmin SDK
            // Example flow:
            // - Read Authorization header
            // - Verify token with FirebaseAdmin.Auth.FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token)
            // - Set context.User principal claims

            await _next(context);
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
