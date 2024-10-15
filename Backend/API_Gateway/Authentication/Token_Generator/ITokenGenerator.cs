namespace Authentication.Token_Generator
{
    public interface ITokenGenerator
    {
        string GenerateToken(string email);
    }
}