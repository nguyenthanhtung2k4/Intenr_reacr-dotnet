using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Dtos;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BowlingLeagueController : ControllerBase
    {
        private IBowlingLeagueRepository _bowlingLeagueRepository;
        public BowlingLeagueController(IBowlingLeagueRepository temp) { _bowlingLeagueRepository = temp; }

        [HttpGet]
        public IEnumerable<Bowler> Get()
        {
            var bowlingLeagueData = _bowlingLeagueRepository.Bowlers
            .Where((e) => e.IsDelete != true)
            .OrderByDescending((e) => e.BowlerId)
            .ToArray();

            return bowlingLeagueData;
        }

        [HttpGet("{id}")]
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
        public IActionResult GetBowlerByTeamId(int teamId)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }
                var data = _bowlingLeagueRepository.Bowlers
                .Where((e) => e.TeamId == teamId && e.IsDelete!= true)
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
    }
}
