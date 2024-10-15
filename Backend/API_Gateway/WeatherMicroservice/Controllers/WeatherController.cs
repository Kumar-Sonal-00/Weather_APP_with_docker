using Microsoft.AspNetCore.Mvc;
using WeatherMicroservice.Services;

namespace WeatherMicroservice.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherController : ControllerBase
    {
        private readonly IWeatherService _weatherService;

        public WeatherController(IWeatherService weatherService)
        {
            _weatherService = weatherService;
        }

        [HttpGet("{city}")]
        public async Task<IActionResult> GetWeather(string city)
        {
            try
            {
                var weather = await _weatherService.GetWeatherAsync(city);
                return Ok(weather);
            }
            catch (Exception ex)
            {
                return BadRequest($" {ex.Message}");
            }
        }

        // Health Check Endpoint
        [HttpGet]
        [Route("health")]
        public IActionResult Health()
        {
            return Ok("Weather Service is healthy");
        }
    }
}