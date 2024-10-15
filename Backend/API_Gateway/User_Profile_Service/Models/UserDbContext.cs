using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Registration_Service.Models
{
    public class UserDbContext
    {
        private readonly IMongoDatabase _database;

        public UserDbContext(IOptions<MongoDbSettings> settings)
        {
            if (string.IsNullOrEmpty(settings.Value.ConnectionString))
            {
                throw new ArgumentNullException(nameof(settings.Value.ConnectionString), "Connection string cannot be null or empty.");
            }

            if (string.IsNullOrEmpty(settings.Value.DatabaseName))
            {
                throw new ArgumentNullException(nameof(settings.Value.DatabaseName), "Database name cannot be null or empty.");
            }

            var client = new MongoClient(settings.Value.ConnectionString);
            _database = client.GetDatabase(settings.Value.DatabaseName);
        }

        public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
    }

    public class MongoDbSettings
    {
        public string ConnectionString { get; set; }
        public string DatabaseName { get; set; }
    }
}