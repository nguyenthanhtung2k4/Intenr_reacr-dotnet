namespace Backend.Services.Interfaces
{
      public interface ITokenService
      {
            string GenerateJwtToken(int userId, string role, string email);
      }
}

