using Favourite_Service.Models;
using Favourite_Service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Favourite_Service.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class FavouriteController : ControllerBase
    {
        private readonly IFavouriteService _favouriteService;

        public FavouriteController(IFavouriteService favouriteService)
        {
            _favouriteService = favouriteService;
        }

        [HttpPost]
        public async Task<IActionResult> AddToFavourites([FromBody] FavouriteItem item)
        {
            try
            {
                // Adding item to favourites
                await _favouriteService.AddToFavouritesAsync(item);
                return CreatedAtAction(nameof(GetFavourites), new { email = item.email }, item);
            }
            catch (Exception ex)
            {
                // Log the exception (implement your logging here)
                return StatusCode(500, "An error occurred while adding to favourites."); // Internal Server Error
            }
        }

        [HttpGet("{email}")]
        public async Task<IActionResult> GetFavourites()
        {
            try
            {
                // Extract email from JWT token claims
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(email))
                {
                    return Unauthorized(new { Message = "No email claim found in the token." });
                }
                var favourites = await _favouriteService.GetFavouritesByEmailAsync(email);
                if (favourites != null && favourites.Any())
                {
                    return Ok(favourites);
                }
                return NotFound(); // No favourites found for the given email
            }
            catch (Exception ex)
            {
                // Log the exception (implement your logging here)
                return StatusCode(500, "An error occurred while retrieving favourites."); // Internal Server Error
            }
        }

        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteFavourite(int Id)
        {
            try
            {
                var result = await _favouriteService.DeleteFavouriteAsync(Id);
                if (result)
                {
                    return NoContent(); // Successfully deleted
                }
                return NotFound(); // Item not found
            }
            catch (Exception ex)
            {
                // Log the exception (implement your logging here)
                return StatusCode(500, "An error occurred while deleting favourite."); // Internal Server Error
            }
        }

        // Health Check Endpoint
        [HttpGet]
        [Route("health")]
        [AllowAnonymous]
        public IActionResult Health()
        {
            return Ok("Favourite Service is healthy");
        }
    }
}