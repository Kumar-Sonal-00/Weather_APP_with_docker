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
    public class WeatherServiceTests
    {
        private readonly WeatherService _service;
        private readonly Mock<HttpMessageHandler> _mockHttpMessageHandler;

        public WeatherServiceTests()
        {
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            var httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            _service = new WeatherService(httpClient);
        }

        [Fact]
        public async Task GetWeatherAsync_ReturnsWeather_WhenCityExists()
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
            var result = await _service.GetWeatherAsync(city);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("London", result.Name);
        }

        [Fact]
        public async Task GetWeatherAsync_ThrowsException_WhenCityDoesNotExist()
        {
            // Arrange
            var city = "UnknownCity";

            _mockHttpMessageHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.NotFound,
                    Content = new StringContent("") // No content for 404
                });

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => _service.GetWeatherAsync(city));

            Assert.Contains("Error retrieving weather data", exception.Message);
        }


    }
}
