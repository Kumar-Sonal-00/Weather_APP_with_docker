using Authentication.Models;

namespace Authentication.Repository
{
    public interface IUserRepo
    {
        User_Login Login(User_Login user);

        bool EmailExists(string email);
    }
}
