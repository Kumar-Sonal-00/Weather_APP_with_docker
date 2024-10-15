using Moq;
using System.Net.Http;
using System.Threading.Tasks;
using WeatherMicroservice.Models;
using WeatherMicroservice.Services;
using Xunit;
using Moq.Protected;
using System.Net;
using System.Text.Json;
using System.Threading;

namespace WeatherMicroservice.Tests.Services
{
    public class GeocodingServiceTests
    {
        private readonly GeocodingService _service;
        private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;

        public GeocodingServiceTests()
        {
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            var httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            _service = new GeocodingService(httpClient);
        }

        [Fact]
        public async Task GetCoordinatesAsync_ReturnsCoordinates_WhenCityExists()
        {
            // Arrange
            var city = "London";
            var response = new List<GeocodingResponse>
            {
                new GeocodingResponse { Name = "London", Country = "UK", Lat = 51.5074, Lon = -0.1278 }
            };
            var responseJson = JsonSerializer.Serialize(response);

            _mockHttpMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(responseJson)
                });

            // Act
            var result = await _service.GetCoordinatesAsync(city);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("London", result.Name);
        }

        [Fact]
        public async Task GetCoordinatesAsync_ReturnsNull_WhenCityDoesNotExist()
        {
            // Arrange
            var city = "UnknownCity";
            var responseJson = JsonSerializer.Serialize(new List<GeocodingResponse>());

            _mockHttpMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(responseJson)
                });

            // Act
            var result = await _service.GetCoordinatesAsync(city);

            // Assert
            Assert.Null(result);
        }
    }
}
