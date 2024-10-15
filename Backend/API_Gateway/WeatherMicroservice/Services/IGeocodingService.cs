using WeatherMicroservice.Models;

namespace WeatherMicroservice.Services
{
    public interface IGeocodingService
    {
        Task<GeocodingResponse> GetCoordinatesAsync(string city);
    }
}