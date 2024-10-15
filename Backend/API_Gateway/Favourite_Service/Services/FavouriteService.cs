using Favourite_Service.Models;
using Favourite_Service.Repository;

namespace Favourite_Service.Services
{
    public class FavouriteService : IFavouriteService
    {
        private readonly IFavouriteRepository _favouriteRepository;

        public FavouriteService(IFavouriteRepository favouriteRepository)
        {
            _favouriteRepository = favouriteRepository;
        }

        // Method to add a favourite item
        public async Task AddToFavouritesAsync(FavouriteItem item)
            => await _favouriteRepository.AddToFavouritesAsync(item);

        // Updated method to get favourites by email
        public async Task<IEnumerable<FavouriteItem>> GetFavouritesByEmailAsync(string email)
            => await _favouriteRepository.GetFavouritesByEmailAsync(email);

        // Method to delete favourites by email
        public async Task<bool> DeleteFavouriteAsync(int Id)
            => await _favouriteRepository.DeleteFavouriteAsync(Id);
    }
}