using Moq;
using System.Threading.Tasks;
using WeatherMicroservice.Controllers;
using WeatherMicroservice.Models;
using WeatherMicroservice.Services;
using Microsoft.AspNetCore.Mvc;
using Xunit;
using FluentAssertions;

namespace WeatherMicroservice.Tests.Controllers
{
    public class WeatherControllerTests
    {
        private readonly WeatherController _controller;
        private readonly Mock<IWeatherService> _mockWeatherService;

        public WeatherControllerTests()
        {
            _mockWeatherService = new Mock<IWeatherService>();
            _controller = new WeatherController(_mockWeatherService.Object);
        }

        [Fact]
        public async Task GetWeather_ReturnsOkResult_WhenCityExists()
        {
            // Arrange
            var city = "London";
            var response = new WeatherResponse
            {
                Name = "London",
                Main = new Main { Temp = 15.5, Humidity = 80, Pressure = 1015 },
                Weather = new List<Weather> { new Weather { Description = "Cloudy", Icon = "cloud" } },
                Wind = new Wind { Speed = 5.5 }
            };
            _mockWeatherService.Setup(s => s.GetWeatherAsync(city)).ReturnsAsync(response);

            // Act
            var result = await _controller.GetWeather(city);

            // Assert
            var okResult = result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult.StatusCode.Should().Be(200);
            okResult.Value.Should().BeEquivalentTo(response);
        }

        [Fact]
        public async Task GetWeather_ReturnsBadRequest_OnException()
        {
            // Arrange
            var city = "ExceptionCity";
            _mockWeatherService.Setup(s => s.GetWeatherAsync(city)).ThrowsAsync(new System.Exception("Test exception"));

            // Act
            var result = await _controller.GetWeather(city);

            // Assert
            var badRequestResult = result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult.StatusCode.Should().Be(400);
        }
    }
}
