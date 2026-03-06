using Backend.Models.Dtos;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class MatchesController(IMatchesService matchesService) : ControllerBase
{
      private readonly IMatchesService _matchesService = matchesService;

      [HttpPost]
      [Authorize(Roles = "Admin")]
      public IActionResult CreateMatch([FromBody] MatchCreateDto matchDto)
      {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var currentUserEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var match = _matchesService.CreateMatch(matchDto, currentUserEmail);

            return Ok(new { message = "Lên lịch trận đấu thành công!", matchId = match.MatchId });
      }

      [HttpPut("{id}")]
      [Authorize(Roles = "Admin")]
      public IActionResult UpdateMatch(int id, [FromBody] MatchCreateDto matchDto)
      {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var currentUserEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var match = _matchesService.UpdateMatch(id, matchDto, currentUserEmail);

            if (match == null) return NotFound("Match not found");

            return Ok(new { message = "Cập nhật trận đấu thành công!", matchId = match.MatchId });
      }

      [HttpGet]
      [AllowAnonymous]
      public IActionResult GetMatches()
      {
            var matches = _matchesService.GetMatches();
            return Ok(matches);
      }

      [HttpGet("{matchId}/scores")]
      [AllowAnonymous]
      public IActionResult GetMatchScores(int matchId)
      {
            var result = _matchesService.GetMatchScores(matchId);
            if (result == null)
            {
                  return NotFound(new { message = "Không tìm thấy match" });
            }

            return Ok(result);
      }

      [HttpPost("match-scores")]
      [Authorize(Roles = "Admin")]
      public IActionResult PostMatchScores([FromBody] MatchScoreInputDto dto)
      {
            if (!ModelState.IsValid)
            {
                  return BadRequest(ModelState);
            }

            var currentUserEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var result = _matchesService.SubmitMatchScores(dto, currentUserEmail);

            if (result == null)
            {
                  return NotFound(new { message = "Không tìm thấy match" });
            }

            return Ok(new
            {
                  message = result.Message,
                  matchId = result.MatchId,
                  gameNumber = result.GameNumber,
                  oddTeamTotal = result.OddTeamTotal,
                  evenTeamTotal = result.EvenTeamTotal,
                  winningTeamId = result.WinningTeamId
            });
      }
}
