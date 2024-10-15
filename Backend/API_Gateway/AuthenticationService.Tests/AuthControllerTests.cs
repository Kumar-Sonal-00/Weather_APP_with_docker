using Moq;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using Authentication.Controllers;
using Authentication.Models;
using Authentication.Repository;
using Authentication.Token_Generator;

namespace AuthenticationService.Tests
{
    public class AuthControllerTests
    {
        private readonly AuthController _controller;
        private readonly Mock<IUserRepo> _mockRepo;
        private readonly Mock<ITokenGenerator> _mockTokenGenerator;

        public AuthControllerTests()
        {
            _mockRepo = new Mock<IUserRepo>();
            _mockTokenGenerator = new Mock<ITokenGenerator>();
            _controller = new AuthController(_mockRepo.Object, _mockTokenGenerator.Object);
        }

        [Fact]
        public void Login_ReturnsNotFound_WhenUserDoesNotExist()
        {
            // Arrange
            var user = new User_Login { email = "user@example.com", password = "password123" };
            _mockRepo.Setup(r => r.EmailExists(user.email)).Returns(false);

            // Act
            var result = _controller.Login(user);

            // Assert
            var notFoundResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(404, notFoundResult.StatusCode);
        }

        [Fact]
        public void Login_ReturnsUnauthorized_WhenCredentialsAreInvalid()
        {
            // Arrange
            var user = new User_Login { email = "user@example.com", password = "wrongpassword" };
            _mockRepo.Setup(r => r.EmailExists(user.email)).Returns(true);
            _mockRepo.Setup(r => r.Login(user)).Returns((User_Login)null);

            // Act
            var result = _controller.Login(user);

            // Assert
            var unauthorizedResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(401, unauthorizedResult.StatusCode);
        }
    }
}
