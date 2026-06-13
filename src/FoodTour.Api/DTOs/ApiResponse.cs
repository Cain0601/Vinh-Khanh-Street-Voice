namespace FoodTour.Api.DTOs
{
    /// <summary>
    /// Standard API response envelope: { success, message, data }
    /// </summary>
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }

        public static ApiResponse<T> Ok(T data, string? message = null) => new()
        {
            Success = true,
            Message = message,
            Data = data
        };

        public static ApiResponse<T> Fail(string message) => new()
        {
            Success = false,
            Message = message,
            Data = default
        };
    }

    /// <summary>
    /// Non-generic version for responses without data
    /// </summary>
    public class ApiResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public object? Data { get; set; }

        public static ApiResponse Ok(string? message = null) => new()
        {
            Success = true,
            Message = message
        };

        public static ApiResponse Ok(object data, string? message = null) => new()
        {
            Success = true,
            Message = message,
            Data = data
        };

        public static ApiResponse Fail(string message) => new()
        {
            Success = false,
            Message = message
        };
    }

    /// <summary>
    /// Paginated response wrapper
    /// </summary>
    public class PaginatedResponse<T>
    {
        public bool Success { get; set; } = true;
        public string? Message { get; set; }
        public List<T> Data { get; set; } = new();
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)Total / PageSize) : 0;
    }
}
