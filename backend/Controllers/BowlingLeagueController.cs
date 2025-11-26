using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Dtos;
using Backend.Data.DTO;
using System.Linq.Expressions;
using Backend.Data.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Validations.Rules;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BowlingLeagueController : ControllerBase
    {
        private IBowlingLeagueRepository _bowlingLeagueRepository;
        private ITokenService _tokenService;
        public BowlingLeagueController(IBowlingLeagueRepository temp, ITokenService token)
        {
            _bowlingLeagueRepository = temp;
            _tokenService = token;
        }

        [HttpGet]
        [AllowAnonymous] // cho phep xem cong khai
        public IEnumerable<Bowler> Get()
        {
            var bowlingLeagueData = _bowlingLeagueRepository.Bowlers
            .Where((e) => e.IsDelete != true)
            .OrderByDescending((e) => e.BowlerId)
            .ToArray();

            return bowlingLeagueData;
        }

        [HttpGet("{id}")]
        [AllowAnonymous]

        public ActionResult<Bowler> Get(int id)
        {
            var bowler = _bowlingLeagueRepository.Bowlers
                // Thêm .Include(b => b.Team) nếu bạn cần lấy thông tin Team
                .FirstOrDefault(b => b.BowlerId == id);

            if (bowler == null)
            {
                return NotFound();
            }

            return Ok(bowler);
        }


        [HttpPatch("{id}")]
        [Authorize]
        public IActionResult Patch(int id, [FromBody] BowlerPatchDto patchDto)
        {
            var Data = _bowlingLeagueRepository.Bowlers
            .FirstOrDefault((b) => b.BowlerId == id);

            if (Data == null) { return NotFound(); }

            if (patchDto.BowlerFirstName != null)
            {
                Data.BowlerFirstName = patchDto.BowlerFirstName;
            }

            if (patchDto.BowlerLastName != null)
            {
                Data.BowlerLastName = patchDto.BowlerLastName;
            }

            if (patchDto.BowlerAddress != null)
            {
                Data.BowlerAddress = patchDto.BowlerAddress;
            }
            if (patchDto.BowlerPhoneNumber != null)
            {
                Data.BowlerPhoneNumber = patchDto.BowlerPhoneNumber;
            }


            // 2. TÍCH HỢP LOGIC XÓA MỀM (Soft Delete)
            // Kiểm tra xem client có gửi trường IsDeleted lên hay không
            if (patchDto.IsDeleted.HasValue)
            {
                // Áp dụng giá trị được gửi lên (true để xóa, false để khôi phục)
                Data.IsDelete = patchDto.IsDeleted.Value;
            }

            try
            {
                // Gọi phương thức Repository đã được triển khai
                _bowlingLeagueRepository.UpdateBowler(Data);

                return Ok(Data);
            }
            catch (Exception ex)
            {
                return NotFound(ex);
            }
        }


        [HttpPost]
        [Authorize]
        public IActionResult Post([FromBody] BowlerPostDto newBowler)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
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
                    TeamId = newBowler.TeamId
                };

                _bowlingLeagueRepository.CreateBowler(bowler);

                return CreatedAtAction(nameof(Get), new { id = bowler.BowlerId }, bowler);
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Lỗi server: {e.Message}");
            }
        }

        [HttpGet("teams")]
        [AllowAnonymous]

        public ActionResult<IEnumerable<Team>> GetTeams()
        {
            var teams = _bowlingLeagueRepository.Teams;
            try
            {
                if (teams == null || !teams.Any())
                {
                    return NotFound("Không tìm thấy danh sách đội.");
                }
                var DES = teams.OrderByDescending(t => t.TeamId).ToList();
                return Ok(DES);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Lỗi server khi tải đội: {ex.Message}");
            }
        }

        [HttpPost("teams")]
        [Authorize]

        public IActionResult PostTeam([FromBody] TeamPostDto newTeamDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var team = new Team
                {
                    TeamName = newTeamDto.TeamName,
                    CaptainId = newTeamDto.CaptainId
                };

                _bowlingLeagueRepository.CreateTeam(team);

                return CreatedAtAction(
                    nameof(GetTeams),
                    new { id = team.TeamId },
                    team
                );
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Lỗi server khi tạo đội: {e.Message}");
            }
        }

        [HttpGet("teams/{teamId}/bowlers")]
        [AllowAnonymous]

        public IActionResult GetBowlerByTeamId(int teamId)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var data = _bowlingLeagueRepository.Bowlers
                .Where((e) => e.TeamId == teamId && e.IsDelete != true)
                .ToList();

                if (data == null || data.Count == 0)
                {
                    return Ok(new List<Bowler>());
                }

                return Ok(data);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $" Loi  sercver khi tai  cau thu: {ex}");
            }
        }

        // ///////////////////////////////////////////////////////////

        [HttpPost("login")]
        [AllowAnonymous] // Login phải cho phép truy cập công khai
        public IActionResult Login([FromBody] loginDto loginDto)
        {
            try
            {
                int? UserId = null;
                if (loginDto.Email == "t@gmail.com" && loginDto.Password == "tungtung")
                {
                    UserId = 1;
                }
                else
                {
                    var acc = _bowlingLeagueRepository.Accounts.FirstOrDefault(e => e.Email == loginDto.Email && !e.IsDelete);

                    if (acc != null && acc.Password != loginDto.Password)
                    {
                        return Unauthorized(new { message = "Email hoặc mật khẩu không đúng! " });
                    }

                }
                if (UserId == null)
                {
                    return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });

                }

                var token = _tokenService.GenerateJwtToken(UserId.Value);

                return Ok(new
                {
                    message = "Dang nhap thanh cong ! ",
                    userid = UserId.Value,
                    token = token
                });


            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Loi server " + ex.Message });
            }
        }

        [HttpGet("accounts")]
        [Authorize]
        public IActionResult Accounts()
        {
            try
            {
                var acc = _bowlingLeagueRepository.Accounts
                .Where(e => !e.IsDelete)
                .OrderByDescending(e => e.Id)
                .ToList();

                return Ok(acc);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Loi server! ", ex });
            }
        }


        [HttpPost("accounts")]
        [Authorize]
        public IActionResult AddAccounts([FromBody] AccountsDto accountsDto)
        {

            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);

                }
                var check = _bowlingLeagueRepository.Accounts
                .Any(a => a.Email == accountsDto.Email);
                if (check)
                {
                    return Conflict(new { message = "Email da ton tai ! " });

                }
                var accounts = new Accounts
                {
                    Email = accountsDto.Email,
                    Password = accountsDto.Password,
                    Role = accountsDto.Role,
                    IsDelete = accountsDto.IsDelete
                };

                _bowlingLeagueRepository.CreateAcounts(accounts);

                return Ok(new { message = "Da them tai  khoan thanh cong" });


            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = "Loi  server ", ex });
            }

        }


        [HttpPost("accounts/{id}")]
        [Authorize]
        public IActionResult AddAccounts(int id, [FromBody] AccountsDto accountsDto)
        {

            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);

                }
                var check = _bowlingLeagueRepository.Accounts
                .Any(a => a.Email == accountsDto.Email);
                if (check)
                {
                    return Conflict(new { message = "Email da ton tai ! " });

                }
                var acc = _bowlingLeagueRepository.Accounts
                .FirstOrDefault(e => e.Id == id);

                if (acc == null) { return NotFound(); }

                if (accountsDto.Email != null) { acc.Email = accountsDto.Email; }
                if (accountsDto.Password != null) { acc.Password = accountsDto.Password; }
                if (accountsDto.Role != null) { acc.Role = accountsDto.Role; }
                /// check  isDelete true la  xoa di
                if (accountsDto.IsDelete == true) { acc.IsDelete = accountsDto.IsDelete; }

                _bowlingLeagueRepository.UpdateAccounts(acc);

                return Ok(acc);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = "Loi  server ", ex });
            }

        }

        [HttpPost("Logout")]
        [AllowAnonymous] // Có thể để [Authorize] hoặc [AllowAnonymous] tùy thuộc vào thiết kế. Để [AllowAnonymous] cho đơn giản.
        public IActionResult Logout()
        {
            return Ok(new { message = "Đăng xuất thành công!" });
        }

        [HttpGet("is-authenticated")]
        [Authorize]
        public IActionResult IsAuthenticated()
        {
            // Lấy ID từ Claims (Payload của JWT)
            var userIdClaim = User.FindFirst("Id");
            return Ok(new
            {
                isAuthenticated = true,
                userId = userIdClaim?.Value
            });
        }
    }
}
