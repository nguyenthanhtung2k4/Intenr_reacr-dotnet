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
    }
}
