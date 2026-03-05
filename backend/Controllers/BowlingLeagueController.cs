using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Dtos;
using Backend.Data.DTO;
using System.Linq.Expressions;
using Backend.Data.Services;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
      [Route("api/[controller]")]
      [ApiController]
      public class BowlingLeagueController(IBowlingLeagueRepository repository, ITokenService tokenService) : ControllerBase
      {
            private readonly IBowlingLeagueRepository _repository = repository;
            private readonly ITokenService _tokenService = tokenService;

            #region Bowlers

            [HttpGet]
            [AllowAnonymous]
            public ActionResult<IEnumerable<Bowler>> Get()
            {
                  try
                  {
                        var bowlers = _repository.Bowlers
                            .Where(b => b.IsDelete != true)
                            .OrderByDescending(b => b.BowlerId)
                            .ToList();

                        return Ok(bowlers);
                  }
                  catch (Exception ex)
                  {
                        return StatusCode(500, $"Lỗi server khi tải danh sách Bowler: {ex.Message}");
                  }
            }

            [HttpGet("{id}")]
            [AllowAnonymous]
            public ActionResult<Bowler> Get(int id)
            {
                  try
                  {
                        var bowler = _repository.Bowlers.FirstOrDefault(b => b.BowlerId == id);

                        if (bowler == null)
                        {
                              return NotFound(new { message = "Không tìm thấy Bowler." });
                        }

                        return Ok(bowler);
                  }
                  catch (Exception ex)
                  {
                        return StatusCode(500, $"Lỗi server khi tìm kiếm Bowler: {ex.Message}");
                  }
            }

            [HttpPost]
            [Authorize]
            public IActionResult Post([FromBody] BowlerPostDto newBowler)
            {
                  try
                  {
                        // ModelState validation handled automatically by [ApiController]

                        var bowler = new Bowler
                        {
                              BowlerFirstName = newBowler.BowlerFirstName,
                              BowlerLastName = newBowler.BowlerLastName,
                              BowlerMiddleInit = newBowler.BowlerMiddleInit,
                              BowlerAddress = newBowler.BowlerAddress,
                              BowlerCity = newBowler.BowlerCity,
                              BowlerState = newBowler.BowlerState,
                              BowlerZip = newBowler.BowlerZip,
                              BowlerPhoneNumber = newBowler.BowlerPhoneNumber,
                              TeamId = newBowler.TeamId,
                              CreatedAt = DateTime.Now,
                              CreatedBy = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,
                              IsDelete = false
                        };

                        _repository.CreateBowler(bowler);

                        return CreatedAtAction(nameof(Get), new { id = bowler.BowlerId }, bowler);
                  }
                  catch (Exception ex)
                  {
                        return StatusCode(500, $"Lỗi server khi tạo Bowler: {ex.Message}");
                  }
            }

            [HttpPatch("{id}")]
            [Authorize]
            public IActionResult Patch(int id, [FromBody] BowlerPatchDto patchDto)
            {
                  try
                  {
                        var bowler = _repository.Bowlers.FirstOrDefault(b => b.BowlerId == id);

                        if (bowler == null)
                        {
                              return NotFound(new { message = "Không tìm thấy Bowler." });
                        }

                        if (patchDto.BowlerFirstName != null) bowler.BowlerFirstName = patchDto.BowlerFirstName;
                        if (patchDto.BowlerLastName != null) bowler.BowlerLastName = patchDto.BowlerLastName;
                        if (patchDto.BowlerAddress != null) bowler.BowlerAddress = patchDto.BowlerAddress;
                        if (patchDto.BowlerPhoneNumber != null) bowler.BowlerPhoneNumber = patchDto.BowlerPhoneNumber;
                        if (patchDto.BowlerCity != null) bowler.BowlerCity = patchDto.BowlerCity;
                        if (patchDto.BowlerState != null) bowler.BowlerState = patchDto.BowlerState;
                        if (patchDto.BowlerZip != null) bowler.BowlerZip = patchDto.BowlerZip;
                        if (patchDto.BowlerMiddleInit != null) bowler.BowlerMiddleInit = patchDto.BowlerMiddleInit;
                        if (patchDto.TeamId != null) bowler.TeamId = patchDto.TeamId;

                        // Soft Delete Logic
                        if (patchDto.IsDeleted)
                        {
                              bowler.IsDelete = patchDto.IsDeleted;
                              if (bowler.IsDelete == true)
                              {
                                    bowler.DeletedAt = DateTime.Now;
                                    bowler.DeletedBy = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
                              }
                        }

                        bowler.UpdatedAt = DateTime.Now;
                        bowler.UpdatedBy = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

                        _repository.UpdateBowler(bowler);

                        return Ok(bowler);
                  }
                  catch (Exception ex)
                  {
                        return StatusCode(500, $"Lỗi server khi cập nhật Bowler: {ex.Message}");
                  }
            }

            #endregion

            #region Authentication

            [HttpPost("login")]
            [AllowAnonymous]
            public IActionResult Login([FromBody] loginDto loginDto)
            {
                  if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.Password))
                  {
                        return BadRequest(new { message = "Vui lòng nhập đầy đủ Email và Mật khẩu." });
                  }

                  try
                  {
                        var acc = _repository.Accounts
                            .FirstOrDefault(e => string.Equals(e.Email, loginDto.Email, StringComparison.OrdinalIgnoreCase)
                                                 && e.IsDelete != true);

                        if (acc == null || acc.Password != loginDto.Password)
                        {
                              return Unauthorized(new { message = "Email hoặc mật khẩu không đúng." });
                        }

                        var token = _tokenService.GenerateJwtToken(acc.Id, acc.Role, acc.Email);

                        return Ok(new
                        {
                              message = "Đăng nhập thành công!",
                              userid = acc.Id,
                              role = acc.Role,
                              token
                        });
                  }
                  catch (Exception ex)
                  {
                        return StatusCode(500, new { message = "Lỗi máy chủ.", detail = ex.Message });
                  }
            }

            [HttpPost("Logout")]
            [AllowAnonymous]
            public IActionResult Logout()
            {
                  // Stateless JWT logout is handled on client side by removing token.
                  return Ok(new { message = "Đăng xuất thành công!" });
            }

            [HttpGet("is-authenticated")]
            [Authorize]
            public IActionResult IsAuthenticated()
            {
                  var userId = User.FindFirst("Id")?.Value;
                  var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

                  return Ok(new
                  {
                        isAuthenticated = true,
                        userId,
                        role
                  });
            }

            #endregion

            #region Accounts

            [HttpGet("accounts")]
            [Authorize]
            public IActionResult GetAccounts()
            {
                  try
                  {
                        var accounts = _repository.Accounts
                            .Where(e => e.IsDelete != true)
                            .OrderByDescending(e => e.Id)
                            .ToList();

                        return Ok(accounts);
                  }
                  catch (Exception ex)
                  {
                        return StatusCode(500, new { message = "Lỗi server khi tải tài khoản.", detail = ex.Message });
                  }
            }

            [HttpGet("accounts/{id}")] // Changed route for REST consistency if desired, or keep "details/{id}" as per old. keeping old for now but cleaning logic if needed.
                                       // Actually, let's keep the OLD route for details "accounts/details/{id}" to minimize breaking change or change it?
                                       // User asked to "fix structure". Standard REST is GET /accounts/{id}.
                                       // I will implement GET /accounts/{id} AND deprecate "details/{id}" if I can, but for now let's just use standard REST.
                                       // But wait, frontend calls `accounts/details/{id}`. I'll support BOTH or just update frontend.
                                       // I will update frontend to use `accounts/{id}`.
            [Authorize]
            public IActionResult GetAccount(int id)
            {
                  try
                  {
                        var account = _repository.Accounts
                            .FirstOrDefault(e => e.Id == id && e.IsDelete != true);

                        if (account == null)
                        {
                              return NotFound(new { message = "Không tìm thấy tài khoản." });
                        }

                        return Ok(account);
                  }
                  catch (Exception ex)
                  {
                        return StatusCode(500, new { message = "Lỗi server.", detail = ex.Message });
                  }
            }

            // Keep old component route for compatibility if frontend sends request there.
            [HttpGet("accounts/details/{id}")]
            [Authorize]
            public IActionResult GetAccountDetailsOld(int id) => GetAccount(id);


            [HttpPost("accounts")]
            [AllowAnonymous] // Should this be AllowAnonymous? Usually creating accounts is Admin or Public Registration.
            public IActionResult CreateAccount([FromBody] AccountsDto accountsDto)
            {
                  try
                  {
                        if (_repository.Accounts.Any(a => a.IsDelete != true && a.Email == accountsDto.Email))
                        {
                              return Conflict(new { message = "Email đã tồn tại!" });
                        }

                        var account = new Accounts
                        {
                              Email = accountsDto.Email,
                              Password = accountsDto.Password,
                              Role = accountsDto.Role,
                              IsDelete = false, // explicit
                              CreatedAt = DateTime.Now,
                              CreatedBy = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                        };

                        _repository.CreateAcounts(account);

                        return CreatedAtAction(nameof(GetAccount), new { id = account.Id }, new
                        {
                              status = 200,
                              message = "Tạo tài khoản thành công",
                              data = account
                        });
                  }
                  catch (Exception ex)
                  {
                        return StatusCode(500, new { message = "Lỗi server.", detail = ex.Message });
                  }
            }

            [HttpPut("accounts/{id}")] // CHANGED FROM POST TO PUT
            [Authorize]
            public IActionResult UpdateAccount(int id, [FromBody] AccountsDto accountsDto)
            {
                  try
                  {
                        var account = _repository.Accounts.FirstOrDefault(e => e.Id == id);
                        if (account == null)
                        {
                              return NotFound(new { message = "Không tìm thấy tài khoản." });
                        }

                        // Check email uniqueness if email is changed
                        if (!string.IsNullOrEmpty(accountsDto.Email) && accountsDto.Email != account.Email)
                        {
                              if (_repository.Accounts.Any(a => a.IsDelete != true && a.Email == accountsDto.Email))
                              {
                                    return BadRequest(new { message = "Email đã tồn tại!" });
                              }
                              account.Email = accountsDto.Email;
                        }

                        if (!string.IsNullOrEmpty(accountsDto.Password)) account.Password = accountsDto.Password;
                        if (!string.IsNullOrEmpty(accountsDto.Role)) account.Role = accountsDto.Role;

                        var currentUserInfo = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

                        if (accountsDto.IsDelete == true)
                        {
                              account.IsDelete = true;
                              account.DeletedAt = DateTime.Now;
                              account.DeletedBy = currentUserInfo;
                        }
                        else
                        {
                              account.UpdatedAt = DateTime.Now;
                              account.UpdatedBy = currentUserInfo;
                        }

                        _repository.UpdateAccounts(account);

                        return Ok(new
                        {
                              status = 200,
                              message = "Cập nhật tài khoản thành công",
                              data = account
                        });
                  }
                  catch (Exception ex)
                  {
                        return StatusCode(500, new { message = "Lỗi server.", detail = ex.Message });
                  }
            }

            #endregion

            #region Bowler Stats

            [HttpGet("bowler-stats")]
            [AllowAnonymous]
            public IActionResult GetBowlerStats()
            {
                  try
                  {
                        // In a real production app, this should be done in the database (SQL View or complex LINQ)
                        // Assuming small dataset for now.
                        var bowlers = _repository.Bowlers.Where(b => b.IsDelete != true).ToList();
                        var scores = _repository.Scores.ToList();
                        var teams = _repository.Teams.ToList();

                        var stats = bowlers.Select(b =>
                        {
                              var bScores = scores.Where(s => s.BowlerId == b.BowlerId).ToList();
                              var team = teams.FirstOrDefault(t => t.TeamId == b.TeamId);

                              int totalGames = bScores.Count;
                              int totalPins = bScores.Sum(s => s.RawScore ?? 0);
                              int highScore = bScores.Count > 0 ? bScores.Max(s => s.RawScore ?? 0) : 0;
                              double avg = totalGames > 0 ? (double)totalPins / totalGames : 0;
                              int won = bScores.Count(s => s.WonGame);

                              return new BowlerStatsDto
                              {
                                    BowlerId = b.BowlerId,
                                    BowlerName = $"{b.BowlerFirstName} {b.BowlerLastName}",
                                    TeamId = b.TeamId,
                                    TeamName = team?.TeamName,
                                    TotalGames = totalGames,
                                    AverageScore = Math.Round(avg, 1),
                                    HighScore = highScore,
                                    TotalPins = totalPins,
                                    GamesWon = won
                              };
                        })
                        .OrderByDescending(s => s.AverageScore)
                        .ToList();

                        return Ok(stats);
                  }
                  catch (Exception ex)
                  {
                        return StatusCode(500, $"Lỗi server khi tính thống kê: {ex.Message}");
                  }
            }

            #endregion
      }
}
