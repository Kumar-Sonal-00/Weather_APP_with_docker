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
    public class GeocodingControllerTests
    {
        private readonly GeocodingController _controller;
        private readonly Mock<IGeocodingService> _mockGeocodingService;

        public GeocodingControllerTests()
        {
            _mockGeocodingService = new Mock<IGeocodingService>();
            _controller = new GeocodingController(_mockGeocodingService.Object);
        }

        [Fact]
        public async Task GetCoordinates_ReturnsOkResult_WhenCityExists()
        {
            // Arrange
            var city = "London";
            var response = new GeocodingResponse { Name = "London", Country = "UK", Lat = 51.5074, Lon = -0.1278 };
            _mockGeocodingService.Setup(s => s.GetCoordinatesAsync(city)).ReturnsAsync(response);

            // Act
            var result = await _controller.GetCoordinates(city);

            // Assert
            var okResult = result.Result as OkObjectResult;
            okResult.Should().NotBeNull();
            okResult.StatusCode.Should().Be(200);
            okResult.Value.Should().BeEquivalentTo(response);
        }

        [Fact]
        public async Task GetCoordinates_ReturnsNotFound_WhenCityDoesNotExist()
        {
            // Arrange
            var city = "UnknownCity";
            _mockGeocodingService.Setup(s => s.GetCoordinatesAsync(city)).ReturnsAsync((GeocodingResponse)null);

            // Act
            var result = await _controller.GetCoordinates(city);

            // Assert
            var notFoundResult = result.Result as NotFoundObjectResult;
            notFoundResult.Should().NotBeNull();
            notFoundResult.StatusCode.Should().Be(404);
        }

        [Fact]
        public async Task GetCoordinates_ReturnsBadRequest_OnException()
        {
            // Arrange
            var city = "ExceptionCity";
            _mockGeocodingService.Setup(s => s.GetCoordinatesAsync(city)).ThrowsAsync(new System.Exception("Test exception"));

            // Act
            var result = await _controller.GetCoordinates(city);

            // Assert
            var badRequestResult = result.Result as BadRequestObjectResult;
            badRequestResult.Should().NotBeNull();
            badRequestResult.StatusCode.Should().Be(400);
        }
    }
}
