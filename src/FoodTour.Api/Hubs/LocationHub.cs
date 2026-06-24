using Microsoft.AspNetCore.SignalR;

namespace FoodTour.Api.Hubs
{
    public class LocationHub : Hub
    {
        private readonly ILogger<LocationHub> _logger;

        public LocationHub(ILogger<LocationHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var userRole = httpContext?.Items["UserRole"]?.ToString() ?? "USER";

            if (userRole == "ADMIN" || userRole == "OWNER")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
                _logger.LogInformation($"Admin connected to LocationHub: {Context.ConnectionId}");
            }
            else
            {
                _logger.LogInformation($"User connected to LocationHub: {Context.ConnectionId}");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var httpContext = Context.GetHttpContext();
            var userId = httpContext?.Items["UserId"]?.ToString();
            
            if (!string.IsNullOrEmpty(userId))
            {
                // Optionally notify admins that a user disconnected so their marker is removed immediately
                await Clients.Group("Admins").SendAsync("UserDisconnected", userId);
            }

            _logger.LogInformation($"Client disconnected from LocationHub: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendLocation(double lat, double lng)
        {
            var httpContext = Context.GetHttpContext();
            var userId = httpContext?.Items["UserId"]?.ToString() ?? Context.ConnectionId;
            var fullName = "Anonymous";
            if (httpContext?.Items["UserData"] is Models.User userData)
            {
                fullName = userData.FullName;
            }

            // Broadcast to all admins
            await Clients.Group("Admins").SendAsync("UserLocationUpdated", new
            {
                userId = userId,
                fullName = fullName,
                lat = lat,
                lng = lng,
                timestamp = DateTime.UtcNow
            });
        }
    }
}
