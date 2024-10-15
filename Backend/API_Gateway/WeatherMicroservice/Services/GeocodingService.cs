using WeatherMicroservice.Models;

namespace WeatherMicroservice.Services
{
    public class GeocodingService : IGeocodingService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey = "8d773f20d7b3f77e9c3ecce23e1d0a5d";
        private readonly string _baseUrl = "http://api.openweathermap.org/geo/1.0/direct";

        public GeocodingService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<GeocodingResponse> GetCoordinatesAsync(string city)
        {
            var url = $"{_baseUrl}?q={city}&limit=1&appid={_apiKey}";
            try 
            {
                var response = await _httpClient.GetFromJsonAsync<List<GeocodingResponse>>(url);
                return response != null && response.Count > 0 ? response[0] : null;
            }
            catch (HttpRequestException ex)
            {
                // Log the exception (implement logging here)
                throw new Exception($"Error retrieving coordinates for city: {city}. Details: {ex.Message}");
            }
            catch (Exception ex)
            {
                // Log the exception (implement logging here)
                throw new Exception($"An unexpected error occurred: {ex.Message}");
            }
        }
    }
}