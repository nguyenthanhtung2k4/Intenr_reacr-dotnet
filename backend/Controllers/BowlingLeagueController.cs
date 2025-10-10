using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Backend.Data;

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
            var bowlingLeagueData = _bowlingLeagueRepository.Bowlers.ToArray();

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
        public IActionResult Post([FromBody] BowlerPostDto postDto)
        {
            var Data = _bowlingLeagueRepository.Bowlers;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Trả về 400 Bad Request nếu dữ liệu không hợp lệ
            }
            if (Data == null)
            {
                return NotFound();
            }

            var new_data = new Bowler
            {
                BowlerLastName = postDto.BowlerLastName,
                BowlerFirstName = postDto.BowlerFirstName,
                BowlerAddress = postDto.BowlerAddress,
                BowlerCity = postDto.BowlerCity,
                BowlerZip = postDto.BowlerZip,
                BowlerPhoneNumber = postDto.BowlerPhoneNumber,
                TeamId = postDto.TeamID
            };

            try
            {
                _bowlingLeagueRepository.createBowler(new_data);
                return Ok(new_data);

            }
            catch (Exception e)
            {
                return NotFound(e);
            }
        }

        [HttpGet("teams")]
        public ActionResult<Team> getTeam()
        {
            var teams = _bowlingLeagueRepository.Teams;
            try
            {
                if (teams == null )
                {
                    return NotFound("Khong tium thay teams!");

                }
                return Ok(teams);

            }
            catch (System.Exception)
            {

                throw;
            }
        }

    }
}
