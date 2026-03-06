using Backend.Models.Entities;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TournamentsController(ITournamentsService tournamentsService) : ControllerBase
{
      private readonly ITournamentsService _tournamentsService = tournamentsService;

      [HttpGet]
      [AllowAnonymous]
      public IActionResult GetTournaments()
      {
            var tournaments = _tournamentsService.GetTournaments();
            return Ok(tournaments);
      }

      [HttpPost]
      [Authorize]
      public IActionResult PostTournament([FromBody] Tournament tournament)
      {
            var currentUserEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var createdTournament = _tournamentsService.CreateTournament(tournament, currentUserEmail);

            return CreatedAtAction(nameof(GetTournamentById), new { tournamentId = createdTournament.TourneyId }, createdTournament);
      }

      [HttpGet("{tournamentId}")]
      [AllowAnonymous]
      public IActionResult GetTournamentById(int tournamentId)
      {
            var tournament = _tournamentsService.GetTournamentById(tournamentId);
            if (tournament == null)
            {
                  return NotFound(new { message = "Không tìm thấy giải đấu" });
            }

            return Ok(tournament);
      }

      [HttpPut("{tournamentId}")]
      [Authorize]
      public IActionResult PutTournament(int tournamentId, [FromBody] Tournament tournament)
      {
            var currentUserEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var result = _tournamentsService.UpdateTournament(tournamentId, tournament, currentUserEmail);

            if (!result.IsSuccess)
            {
                  if (result.StatusCode == 400)
                  {
                        return BadRequest(result.Message);
                  }

                  if (result.StatusCode == 404)
                  {
                        return NotFound(result.Message);
                  }

                  return StatusCode(result.StatusCode, result.Message);
            }

            return Ok(result.Tournament);
      }

      [HttpGet("tourneymatch")]
      [AllowAnonymous]
      public IActionResult GetTourneyMatch()
      {
            var tournamentMatches = _tournamentsService.GetTourneyMatches();
            return Ok(tournamentMatches);
      }
}
