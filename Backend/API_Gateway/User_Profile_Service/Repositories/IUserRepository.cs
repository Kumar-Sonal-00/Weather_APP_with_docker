using Registration_Service.Models;

namespace Registration_Service.Repository
{
    public interface IUserRepository
    {
        Task AddUser(User user);
    }
}