using Backend.Models.Dtos;
using Backend.Models.Entities;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BowlingLeagueController(IBowlingLeagueService bowlingLeagueService) : ControllerBase
{
      private readonly IBowlingLeagueService _bowlingLeagueService = bowlingLeagueService;

      [HttpGet]
      [AllowAnonymous]
      public ActionResult<IEnumerable<Bowler>> Get()
      {
            var bowlers = _bowlingLeagueService.GetBowlers();
            return Ok(bowlers);
      }

      [HttpGet("{id}")]
      [AllowAnonymous]
      public ActionResult<Bowler> Get(int id)
      {
            var bowler = _bowlingLeagueService.GetBowlerById(id);
            if (bowler == null)
            {
                  return NotFound(new { message = "Không tìm thấy Bowler." });
            }

            return Ok(bowler);
      }

      [HttpPost]
      [Authorize]
      public IActionResult Post([FromBody] BowlerPostDto newBowler)
      {
            var currentUserEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var bowler = _bowlingLeagueService.CreateBowler(newBowler, currentUserEmail);
            return CreatedAtAction(nameof(Get), new { id = bowler.BowlerId }, bowler);
      }

      [HttpPatch("{id}")]
      [Authorize]
      public IActionResult Patch(int id, [FromBody] BowlerPatchDto patchDto)
      {
            var currentUserEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var bowler = _bowlingLeagueService.PatchBowler(id, patchDto, currentUserEmail);

            if (bowler == null)
            {
                  return NotFound(new { message = "Không tìm thấy Bowler." });
            }

            return Ok(bowler);
      }

      [HttpPost("login")]
      [AllowAnonymous]
      public IActionResult Login([FromBody] loginDto loginDto)
      {
            if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.Password))
            {
                  return BadRequest(new { message = "Vui lòng nhập đầy đủ Email và Mật khẩu." });
            }

            var authResult = _bowlingLeagueService.Authenticate(loginDto);
            if (!authResult.IsSuccess)
            {
                  return Unauthorized(new { message = authResult.Message });
            }

            return Ok(new
            {
                  message = authResult.Message,
                  userid = authResult.UserId,
                  role = authResult.Role,
                  token = authResult.Token
            });
      }

      [HttpPost("Logout")]
      [AllowAnonymous]
      public IActionResult Logout()
      {
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

      [HttpGet("accounts")]
      [Authorize]
      public IActionResult GetAccounts()
      {
            var accounts = _bowlingLeagueService.GetAccounts();
            return Ok(accounts);
      }

      [HttpGet("accounts/{id}")]
      [Authorize]
      public IActionResult GetAccount(int id)
      {
            var account = _bowlingLeagueService.GetAccountById(id);
            if (account == null)
            {
                  return NotFound(new { message = "Không tìm thấy tài khoản." });
            }

            return Ok(account);
      }

      [HttpGet("accounts/details/{id}")]
      [Authorize]
      public IActionResult GetAccountDetailsOld(int id) => GetAccount(id);

      [HttpPost("accounts")]
      [AllowAnonymous]
      public IActionResult CreateAccount([FromBody] AccountsDto accountsDto)
      {
            var currentUserEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var result = _bowlingLeagueService.CreateAccount(accountsDto, currentUserEmail);

            if (!result.IsSuccess)
            {
                  return StatusCode(result.StatusCode, new { message = result.Message });
            }

            return CreatedAtAction(nameof(GetAccount), new { id = result.Account!.Id }, new
            {
                  status = 200,
                  message = result.Message,
                  data = result.Account
            });
      }

      [HttpPut("accounts/{id}")]
      [Authorize]
      public IActionResult UpdateAccount(int id, [FromBody] AccountsDto accountsDto)
      {
            var currentUserEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var result = _bowlingLeagueService.UpdateAccount(id, accountsDto, currentUserEmail);

            if (!result.IsSuccess)
            {
                  return StatusCode(result.StatusCode, new { message = result.Message });
            }

            return Ok(new
            {
                  status = 200,
                  message = result.Message,
                  data = result.Account
            });
      }

      [HttpGet("bowler-stats")]
      [AllowAnonymous]
      public IActionResult GetBowlerStats()
      {
            var stats = _bowlingLeagueService.GetBowlerStats();
            return Ok(stats);
      }
}
