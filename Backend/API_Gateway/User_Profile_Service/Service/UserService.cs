using Registration_Service.Exceptions;
using Registration_Service.Models;
using Registration_Service.Repository;
using System.Threading.Tasks;

namespace Registration_Service.ServiceRepo
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repository;

        public UserService(IUserRepository repository)
        {
            _repository = repository;
        }

        public async Task AddUser(User user)
        {

            // Check if Password and ConfirmPassword match
            if (user.password != user.confirmPassword)
            {
                throw new Exception("Password and Confirm Password do not match.");
            }

            // Call the AddUser method in the repository
            await  _repository.AddUser(user);
            await Task.CompletedTask;
            // Call the AddUser method in the repository
            //await _repository.AddUser(user);
            //await Task.CompletedTask; // Since the repository method is synchronous, just return a completed task
        }
    }
}