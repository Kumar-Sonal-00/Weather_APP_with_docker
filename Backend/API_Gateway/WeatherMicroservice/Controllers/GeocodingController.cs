using Microsoft.AspNetCore.Mvc;
using WeatherMicroservice.Models;
using WeatherMicroservice.Services;

namespace WeatherMicroservice.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GeocodingController : ControllerBase
    {
        private readonly IGeocodingService _geocodingService;

        public GeocodingController(IGeocodingService geocodingService)
        {
            _geocodingService = geocodingService;
        }

        [HttpGet("{city}")]
        public async Task<ActionResult<GeocodingResponse>> GetCoordinates(string city)
        {
            try
            {
                var coordinates = await _geocodingService.GetCoordinatesAsync(city);

                if (coordinates == null)
                {
                    return NotFound($"No coordinates found for city: {city}");
                }

                return Ok(coordinates);
            }
            

             catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }
    }
}