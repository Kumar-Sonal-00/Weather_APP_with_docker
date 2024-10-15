using Favourite_Service.Models;

namespace Favourite_Service.Repository
{
    public interface IFavouriteRepository
    {
        Task AddToFavouritesAsync(FavouriteItem item);

        // Method to fetch favourites by email
        Task<IEnumerable<FavouriteItem>> GetFavouritesByEmailAsync(string email);

        // Method to delete favourites by email
        Task<bool> DeleteFavouriteAsync(int Id);
    }
}