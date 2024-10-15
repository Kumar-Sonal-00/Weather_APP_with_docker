using Favourite_Service.Controllers;
using Favourite_Service.Models;
using Favourite_Service.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Http;

namespace FavouriteService.Tests
{
    public class FavouriteControllerTests
    {
        private readonly Mock<IFavouriteService> _favouriteServiceMock;
        private readonly FavouriteController _controller;

        public FavouriteControllerTests()
        {
            // Initialize the mock service
            _favouriteServiceMock = new Mock<IFavouriteService>();

            // Create controller with the mocked service
            _controller = new FavouriteController(_favouriteServiceMock.Object);

            // Set up a fake identity for testing user claims
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Email, "testuser@example.com")
            }, "mock"));
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        // Test for AddToFavourites
        [Fact]
        public async Task AddToFavourites_ShouldReturnCreatedAtAction_WhenValidItem()
        {
            // Arrange
            var newItem = new FavouriteItem { Id = 1, city = "New York", email = "testuser@example.com" };

            // Act
            var result = await _controller.AddToFavourites(newItem);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result); // Check if CreatedAtActionResult is returned
            Assert.Equal(nameof(_controller.GetFavourites), createdResult.ActionName); // Check if correct action is targeted
            Assert.Equal("testuser@example.com", createdResult.RouteValues["email"]); // Check if email is passed correctly
        }

        // Test for GetFavourites when there are items
        [Fact]
        public async Task GetFavourites_ShouldReturnOkWithItems_WhenItemsExist()
        {
            // Arrange
            var favourites = new List<FavouriteItem>
            {
                new FavouriteItem { Id = 1, city = "London", email = "testuser@example.com" },
                new FavouriteItem { Id = 2, city = "Paris", email = "testuser@example.com" }
            };
            _favouriteServiceMock.Setup(service => service.GetFavouritesByEmailAsync("testuser@example.com"))
                                 .ReturnsAsync(favourites);

            // Act
            var result = await _controller.GetFavourites();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result); // Assert that the result is OK
            var returnItems = Assert.IsAssignableFrom<IEnumerable<FavouriteItem>>(okResult.Value); // Assert the returned value is of expected type
            Assert.Equal(2, returnItems.Count()); // Ensure we get 2 items
        }

        // Test for GetFavourites when no items exist
        [Fact]
        public async Task GetFavourites_ShouldReturnNotFound_WhenNoItemsExist()
        {
            // Arrange
            _favouriteServiceMock.Setup(service => service.GetFavouritesByEmailAsync("testuser@example.com"))
                                 .ReturnsAsync(new List<FavouriteItem>());

            // Act
            var result = await _controller.GetFavourites();

            // Assert
            Assert.IsType<NotFoundResult>(result); // Assert that NotFound is returned
        }

        // Test for DeleteFavourite when the item exists
        [Fact]
        public async Task DeleteFavourite_ShouldReturnNoContent_WhenItemDeleted()
        {
            // Arrange
            _favouriteServiceMock.Setup(service => service.DeleteFavouriteAsync(1))
                                 .ReturnsAsync(true); // Set up the mock service to return true for delete

            // Act
            var result = await _controller.DeleteFavourite(1);

            // Assert
            Assert.IsType<NoContentResult>(result); // Assert that NoContent is returned
        }

        // Test for DeleteFavourite when the item doesn't exist
        [Fact]
        public async Task DeleteFavourite_ShouldReturnNotFound_WhenItemDoesNotExist()
        {
            // Arrange
            _favouriteServiceMock.Setup(service => service.DeleteFavouriteAsync(1))
                                 .ReturnsAsync(false); // Set up the mock service to return false for delete

            // Act
            var result = await _controller.DeleteFavourite(1);

            // Assert
            Assert.IsType<NotFoundResult>(result); // Assert that NotFound is returned
        }
    }
}

