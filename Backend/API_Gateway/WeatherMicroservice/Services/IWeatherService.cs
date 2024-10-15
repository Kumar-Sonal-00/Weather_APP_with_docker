using WeatherMicroservice.Models;

namespace WeatherMicroservice.Services
{
    public interface IWeatherService
    {
        Task<WeatherResponse> GetWeatherAsync(string city);
    }
}