using System.Text.Json.Serialization;

namespace FoodTour.Api.DTOs
{
    public class LocationDto
    {
        [JsonPropertyName("lat")]
        public double Lat { get; set; }

        [JsonPropertyName("lng")]
        public double Lng { get; set; }
    }

    public class CreatePoiDto
    {
        public string OwnerId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Summary { get; set; }
        public string? Address { get; set; }
        public string? CategoryId { get; set; }
        public LocationDto? Location { get; set; }
    }
}
