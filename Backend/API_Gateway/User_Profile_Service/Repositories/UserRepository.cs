using MongoDB.Driver;
using Registration_Service.Exceptions;
using Registration_Service.Models;

namespace Registration_Service.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly UserDbContext _userDbContext;

        public UserRepository(UserDbContext userDbContext)
        {
            _userDbContext = userDbContext;
        }

        public async Task AddUser(User user)
        {
            var existingUser = await _userDbContext.Users.Find(u => u.email == user.email).FirstOrDefaultAsync();
            if (existingUser != null)
            {
                throw new UserAlreadyExistsException($"User with email {user.email} already exists.");
            }
            await _userDbContext.Users.InsertOneAsync(user);
        }
    }
}