using Authentication.Models;
using MongoDB.Driver;

namespace Authentication.Repository
{
    public class UserRepo : IUserRepo
    {
        private readonly Userdbcontext _context;

        public UserRepo(Userdbcontext context)
        {
            _context = context;
        }

        // Method to check if the user exists by email
        public bool EmailExists(string email)
        {
            return _context.Trainee
                .Count(t => t.email == email) > 0; // Returns true if any user exists with the given email
        }

        public User_Login Login(User_Login user)
        {
            return _context.Trainee
                .Find(t => t.email == user.email && t.password == user.password)
                .FirstOrDefault();
        }
    }
}