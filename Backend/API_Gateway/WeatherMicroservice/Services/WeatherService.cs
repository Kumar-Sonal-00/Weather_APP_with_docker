using WeatherMicroservice.Models;

namespace WeatherMicroservice.Services
{
    public class WeatherService : IWeatherService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey = "8d773f20d7b3f77e9c3ecce23e1d0a5d"; 
        private readonly string _baseUrl = "http://api.openweathermap.org/data/2.5/weather";

        public WeatherService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<WeatherResponse> GetWeatherAsync(string city)
        {
            var url = $"{_baseUrl}?q={city}&appid={_apiKey}&units=metric";
            try
            {
                var response = await _httpClient.GetFromJsonAsync<WeatherResponse>(url);
                return response;
            }
            

             catch (HttpRequestException ex)
            {
                // Log the exception (implement logging here)
                throw new Exception($"Error retrieving weather data for coordinates: {city}. Details: {ex.Message}");
            }
            catch (Exception ex)
            {
                // Log the exception (implement logging here)
                throw new Exception($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}