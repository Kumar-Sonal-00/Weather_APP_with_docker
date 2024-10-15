using Authentication.Models;
using Authentication.Repository;
using Authentication.Token_Generator;
using Microsoft.AspNetCore.Mvc;

namespace Authentication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepo _repo;
        private readonly ITokenGenerator _tokenGenerator;

        public AuthController(IUserRepo repo, ITokenGenerator tokenGenerator)
        {
            _repo = repo;
            _tokenGenerator = tokenGenerator;
        }

        [HttpPost]
        [Route("Login")]
        public IActionResult Login([FromBody] User_Login user)
        {
            try
            {
                // Check if the email exists
                if (!_repo.EmailExists(user.email))
                {
                    return StatusCode(404, "User does not exists");
                }
                var res = _repo.Login(user);
                if (res != null)
                {
                    var token = _tokenGenerator.GenerateToken(user.email);
                    return Ok(new { token });
                }
                else
                {
                    return StatusCode(401, "Invalid Credentials");
                }
            }
            catch (Exception ex)
            {
                // Log the exception (ex) here if you have a logging framework
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }


        // Health Check Endpoint
        [HttpGet]
        [Route("health")]
        public IActionResult Health()
        {
            return Ok("Authentication Service is healthy");
        }
    }
}