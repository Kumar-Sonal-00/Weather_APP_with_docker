namespace WeatherMicroservice.Models
{
    public class GeocodingResponse
    {
        public string Name { get; set; } // City name
        public string Country { get; set; } // Country code
        public double Lat { get; set; } // Latitude
        public double Lon { get; set; } // Longitude
    }
}