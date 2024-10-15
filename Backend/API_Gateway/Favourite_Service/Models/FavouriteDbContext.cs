using Microsoft.EntityFrameworkCore;

namespace Favourite_Service.Models
{   
    public class FavouriteDbContext : DbContext
    {
        
            public FavouriteDbContext(DbContextOptions<FavouriteDbContext> options) : base(options) { }

            public DbSet<FavouriteItem> FavouriteItems { get; set; }
        }
    }