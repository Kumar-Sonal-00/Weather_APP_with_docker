using Favourite_Service.Models;
using Microsoft.EntityFrameworkCore;

namespace Favourite_Service.Repository
{
    public class FavouriteRepository : IFavouriteRepository
    {
        private readonly FavouriteDbContext _context;

        public FavouriteRepository(FavouriteDbContext context)
        {
            _context = context;
        }

        // Method to add a favourite item to the database
        public async Task AddToFavouritesAsync(FavouriteItem item)
        {
            await _context.FavouriteItems.AddAsync(item);
            await _context.SaveChangesAsync(); // Save changes after adding the item
        }

        // Method to fetch all favourite items for a specific email
        public async Task<IEnumerable<FavouriteItem>> GetFavouritesByEmailAsync(string email)
        {
            // Fetch all items for the given email
            return await _context.FavouriteItems
                .Where(f => f.email == email)
                .ToListAsync();
        }

        // Method to delete a favourite item by email
        public async Task<bool> DeleteFavouriteAsync(int Id)
        {
            // Find items that match the given email
            var favouriteItem = await _context.FavouriteItems
                .FirstOrDefaultAsync(f => f.Id == Id);

            if (favouriteItem == null)
            {
                return false; // No item found for the given id
            }

            _context.FavouriteItems.RemoveRange(favouriteItem); // Remove all items associated with the email
            await _context.SaveChangesAsync(); // Save changes after deletion

            return true; // Successfully deleted
        }
    }
}