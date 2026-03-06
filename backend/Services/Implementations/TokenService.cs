using System.Text;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Configuration;
using System;
using Backend.Services.Interfaces;

namespace Backend.Services.Implementations
{
      public class TokenService : ITokenService
      {
            private readonly IConfiguration _configuration;

            public TokenService(IConfiguration configuration)
            {
                  _configuration = configuration;
            }
            public string GenerateJwtToken(int userId, string role, string email)
            {
                  var issuer = _configuration["Jwt:Issuer"];
                  var audience = _configuration["Jwt:Audience"];
                  var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured."));

                  var tokenDescriptor = new SecurityTokenDescriptor
                  {
                        // Lưu UserId vào Claims
                        Subject = new ClaimsIdentity(new[]
                      {
                    new Claim("Id", userId.ToString()),
                    new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                    new Claim(ClaimTypes.Role, role ?? "User"), // Add Role
                    new Claim(ClaimTypes.Email, email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                }),
                        Expires = DateTime.UtcNow.AddMinutes(60),
                        Issuer = issuer,
                        Audience = audience,
                        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha512Signature)
                  };

                  var tokenHandler = new JwtSecurityTokenHandler();
                  var token = tokenHandler.CreateToken(tokenDescriptor);
                  return tokenHandler.WriteToken(token);
            }
      }
}

