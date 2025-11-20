using Microsoft.EntityFrameworkCore;
using Backend.Data;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ✅ Thêm dòng này để đăng ký Swagger
builder.Services.AddSwaggerGen();

// Add controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Database + Repository
builder.Services.AddDbContext<BowlingLeagueContext>(options =>
    options.UseSqlite(builder.Configuration["ConnectionStrings:BowlingLeagueConnection"]));

builder.Services.AddScoped<IBowlingLeagueRepository, EFBowlingLeagueRepository>();

// ✅ Cấu hình CORS cho React
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

// 1. Thêm dịch vụ Cache phân tán (Cần cho Session)
builder.Services.AddDistributedMemoryCache();
// 2. Thêm dịch vụ Session
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Session hết hạn sau 30 phút không hoạt động
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    // options.Cookie.SameSite = SameSiteMode.None;
    // options.Cookie.SecurePolicy = CookieSecurePolicy.Always; 
    options.Cookie.SecurePolicy = CookieSecurePolicy.None; // Tạm thời tắt yêu cầu HTTPS trong môi trường dev
    options.Cookie.SameSite = SameSiteMode.Lax; // Lax hoạt động tốt hơn None trên HTTP

});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // ✅ Swagger sẽ hoạt động đúng sau khi đăng ký ở trên
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseSession();
app.UseAuthorization();
app.MapControllers();
app.Run();
