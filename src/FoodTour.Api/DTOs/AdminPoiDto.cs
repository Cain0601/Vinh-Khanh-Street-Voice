namespace FoodTour.Api.DTOs
{
   
    public class AdminPoiDto
    {
        public string? OwnerId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Summary { get; set; }
        public string? Address { get; set; }
        public string? CategoryId { get; set; }
        public AdminPoiLocationDto? Location { get; set; }
        public string? AudioUrl { get; set; }
        public string? Status { get; set; }
        public bool? IsActive { get; set; }
    }

    public class AdminPoiLocationDto
    {
        public double Lat { get; set; }
        public double Lng { get; set; }
    }
}