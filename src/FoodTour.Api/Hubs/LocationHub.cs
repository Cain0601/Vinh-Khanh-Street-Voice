using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace FoodTour.Api.Hubs
{
    public class LocationHub : Hub
    {
        private readonly ILogger<LocationHub> _logger;
        private static readonly ConcurrentDictionary<string, string> _connectionClientKeys = new();
        private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> _onlineClients = new();

        public LocationHub(ILogger<LocationHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();

            // Middleware skips auth for /hubs/ paths (anonymous allowed).
            // Role may be resolved by middleware if token is valid; otherwise we mark as GUEST.
            var userRole = (httpContext?.Items["UserRole"]?.ToString() ?? "GUEST").ToUpperInvariant();

            if (userRole == "ADMIN")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
                _logger.LogInformation($"Admin connected to LocationHub: {Context.ConnectionId}");
            }
            else
            {
                // Count unique devices, not raw SignalR connections.
                // A device can open multiple connections (global tracker + map location sender).
                var clientKey = GetClientKey(httpContext);
                var connections = _onlineClients.GetOrAdd(clientKey, _ => new ConcurrentDictionary<string, byte>());
                MergeVisitorConnectionsIntoUser(httpContext, clientKey, connections);
                connections.TryAdd(Context.ConnectionId, 0);
                _connectionClientKeys.TryAdd(Context.ConnectionId, clientKey);

                _logger.LogInformation($"User/Guest connected to LocationHub: {Context.ConnectionId} (role={userRole}, client={clientKey})");
                await Clients.Group("Admins").SendAsync("OnlineCountUpdated", GetOnlineClientCount());
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var httpContext = Context.GetHttpContext();
            var userId = httpContext?.Items["UserId"]?.ToString() ?? Context.ConnectionId;
            
            if (!string.IsNullOrEmpty(userId))
            {
                // Optionally notify admins that a user disconnected so their marker is removed immediately
                await Clients.Group("Admins").SendAsync("UserDisconnected", userId);
            }

            if (_connectionClientKeys.TryRemove(Context.ConnectionId, out var clientKey) &&
                _onlineClients.TryGetValue(clientKey, out var connections))
            {
                connections.TryRemove(Context.ConnectionId, out _);

                if (connections.IsEmpty)
                {
                    _onlineClients.TryRemove(clientKey, out _);
                }

                await Clients.Group("Admins").SendAsync("OnlineCountUpdated", GetOnlineClientCount());
            }

            _logger.LogInformation($"Client disconnected from LocationHub: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }

        public async Task<int> GetOnlineCount()
        {
            return GetOnlineClientCount();
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

        private string GetClientKey(HttpContext? httpContext)
        {
            var visitorId = httpContext?.Request.Query["visitorId"].ToString();
            if (!string.IsNullOrWhiteSpace(visitorId))
            {
                return $"visitor:{visitorId}";
            }

            var userId = httpContext?.Items["UserId"]?.ToString();
            if (!string.IsNullOrWhiteSpace(userId))
            {
                return $"user:{userId}";
            }

            return $"connection:{Context.ConnectionId}";
        }

        private static void MergeVisitorConnectionsIntoUser(
            HttpContext? httpContext,
            string clientKey,
            ConcurrentDictionary<string, byte> targetConnections)
        {
            if (!clientKey.StartsWith("user:", StringComparison.Ordinal))
            {
                return;
            }

            var visitorId = httpContext?.Request.Query["visitorId"].ToString();
            if (string.IsNullOrWhiteSpace(visitorId))
            {
                return;
            }

            var visitorKey = $"visitor:{visitorId}";
            if (!_onlineClients.TryRemove(visitorKey, out var visitorConnections))
            {
                return;
            }

            foreach (var connectionId in visitorConnections.Keys)
            {
                targetConnections.TryAdd(connectionId, 0);
                _connectionClientKeys[connectionId] = clientKey;
            }
        }

        private static int GetOnlineClientCount()
        {
            return _onlineClients.Count(kvp => !kvp.Value.IsEmpty);
        }
    }
}
