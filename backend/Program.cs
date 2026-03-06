using Backend.Data.Contexts;
using Backend.Data.Repositories;
using Backend.Middleware;
using Backend.Services.Implementations;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
      options.SwaggerDoc("v1", new OpenApiInfo
      {
            Title = "Bowling League API",
            Version = "v1",
            Description = "Backend API for Bowling League management"
      });

      options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
      {
            Name = "Authorization",
            Description = "JWT Authorization header using the Bearer scheme. Example: Bearer {token}",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT"
      });

      options.AddSecurityRequirement(new OpenApiSecurityRequirement
      {
            {
                  new OpenApiSecurityScheme
                  {
                        Reference = new OpenApiReference
                        {
                              Type = ReferenceType.SecurityScheme,
                              Id = "Bearer"
                        }
                  },
                  Array.Empty<string>()
            }
      });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
          options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
          options.JsonSerializerOptions.WriteIndented = true;
    });

builder.Services.AddDbContext<BowlingLeagueContext>(options =>
    options.UseSqlite(builder.Configuration["ConnectionStrings:BowlingLeagueConnection"]));

builder.Services.AddScoped<IBowlingLeagueRepository, EFBowlingLeagueRepository>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IBowlingLeagueService, BowlingLeagueService>();
builder.Services.AddScoped<ITeamsService, TeamsService>();
builder.Services.AddScoped<IMatchesService, MatchesService>();
builder.Services.AddScoped<IStandingsService, StandingsService>();
builder.Services.AddScoped<ITournamentsService, TournamentsService>();

builder.Services.AddCors(options =>
{
      options.AddPolicy("AllowReactApp", policy =>
      {
            policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
      });
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
          var key = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured.");

          options.TokenValidationParameters = new TokenValidationParameters
          {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
          };
    });

builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build());

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
      app.UseSwagger();
      app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
