using Favourite_Service.Models;
using Favourite_Service.Repository;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace FavouriteService.Tests
{
    public class FavouriteRepositoryTests
    {
        private readonly FavouriteDbContext _context;
        private readonly FavouriteRepository _repository;

        public FavouriteRepositoryTests()
        {
            // Setting up a unique in-memory database for testing
            var options = new DbContextOptionsBuilder<FavouriteDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString()) // Unique name for each test
                .Options;

            _context = new FavouriteDbContext(options);
            _repository = new FavouriteRepository(_context);
        }

        [Fact]
        public async Task AddToFavouritesAsync_ShouldAddItem()
        {
            // Arrange
            var item = new FavouriteItem { city = "London", email = "test@example.com" };

            // Act
            await _repository.AddToFavouritesAsync(item);
            var result = await _context.FavouriteItems.ToListAsync();

            // Assert
            Assert.Single(result);
            Assert.Equal("London", result[0].city);
        }

        [Fact]
        public async Task DeleteFavouriteAsync_ShouldRemoveItemFromDatabase()
        {
            // Arrange
            var newItem = new FavouriteItem { Id = 1, city = "New York", email = "testuser@example.com" };
            await _repository.AddToFavouritesAsync(newItem);

            // Act
            var result = await _repository.DeleteFavouriteAsync(1);

            // Assert
            Assert.True(result);
            var item = await _context.FavouriteItems.FindAsync(1);
            Assert.Null(item); // Ensure the item is deleted
        }

        [Fact]
        public async Task DeleteFavouriteAsync_ShouldReturnFalseIfItemNotFound()
        {
            // Act
            var result = await _repository.DeleteFavouriteAsync(99); // ID that does not exist

            // Assert
            Assert.False(result); // Expect false since item was not found
        }

        [Fact]
        public async Task GetFavouritesByEmailAsync_ShouldReturnCorrectItems()
        {
            // Arrange
            var favourites = new List<FavouriteItem>
            {
                new FavouriteItem { Id = 1, city = "New York", email = "testuser@example.com" },
                new FavouriteItem { Id = 2, city = "Los Angeles", email = "testuser@example.com" }
            };

            foreach (var fav in favourites)
            {
                await _repository.AddToFavouritesAsync(fav);
            }

            // Act
            var result = await _repository.GetFavouritesByEmailAsync("testuser@example.com");

            // Assert
            Assert.Equal(2, result.Count());
            Assert.Contains(result, f => f.city == "New York");
            Assert.Contains(result, f => f.city == "Los Angeles");
        }

        // Cleanup after each test
        public void Dispose()
        {
            _context.Database.EnsureDeleted(); // Clean up the in-memory database
            _context.Dispose();
        }
    }
}
