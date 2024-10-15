using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Registration_Service.Exceptions;
using Registration_Service.Models;
using Registration_Service.ServiceRepo;

namespace Registration_Service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // POST: api/user
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] User user)
        {

            // Validate the user object
            if (user == null)
            {
                return BadRequest(new { Status = 400, Message = "User cannot be null." });
            }

            try
            {
                await _userService.AddUser(user);
                return Ok(new { Status = 200, Message = "User Added!" });
            }
            catch (UserAlreadyExistsException ex)
            {
                return Conflict(new { Status = 409, Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while adding the user.", Error = ex.Message });
            }
        }

        // Health Check Endpoint
        [HttpGet]
        [Route("health")]
        public IActionResult Health()
        {
            return Ok("Registration Service is healthy");
        }
    }
}
