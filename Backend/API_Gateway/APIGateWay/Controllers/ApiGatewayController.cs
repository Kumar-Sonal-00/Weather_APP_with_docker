using Microsoft.AspNetCore.Mvc;

namespace APIGateWay.Controllers
{

    [Route("apigateway")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok("API Gateway is healthy");
        }
    }
}
