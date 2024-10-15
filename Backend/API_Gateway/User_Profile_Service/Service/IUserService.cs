using Registration_Service.Models;
using System.Threading.Tasks;

namespace Registration_Service.ServiceRepo
{
    public interface IUserService
    {
        Task AddUser(User user);
    }
}