using Moq;
using Xunit;
using Authentication.Token_Generator;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

namespace AuthenticationService.Tests
{
    public class TokenGeneratorTests
    {
        private readonly TokenGenerator _tokenGenerator;
        private readonly Mock<IConfiguration> _mockConfig;

        public TokenGeneratorTests()
        {
            _mockConfig = new Mock<IConfiguration>();
            _mockConfig.SetupGet(c => c["Jwt:Key"]).Returns("supersecretkey123456");
            _mockConfig.SetupGet(c => c["Jwt:Issuer"]).Returns("auth-service");
            _mockConfig.SetupGet(c => c["Jwt:Audience"]).Returns("auth-audience");
            _mockConfig.SetupGet(c => c["Jwt:ExpireMinutes"]).Returns("60");

            _tokenGenerator = new TokenGenerator(_mockConfig.Object);
        }
    }
}
