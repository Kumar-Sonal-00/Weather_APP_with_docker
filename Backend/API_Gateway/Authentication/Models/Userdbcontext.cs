using MongoDB.Driver;

namespace Authentication.Models
{
    public class Userdbcontext
    {
        private readonly IMongoDatabase database;

        public Userdbcontext(IConfiguration config)
        {
            var client = new MongoClient(config.GetConnectionString("MyMongodbCon"));
            database = client.GetDatabase(config.GetSection("DatabaseName").Value);
        }

        public IMongoCollection<User_Login> Trainee => database.GetCollection<User_Login>("Users");
    }
}
