using Backend.Models.Dtos;
using Backend.Models.Entities;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TeamsController(ITeamsService teamsService) : ControllerBase
{
      private readonly ITeamsService _teamsService = teamsService;

      [HttpGet]
      [AllowAnonymous]
      public ActionResult<IEnumerable<Team>> GetTeams()
      {
            var teams = _teamsService.GetTeams();
            if (!teams.Any())
            {
                  return NotFound("Không tìm thấy danh sách đội.");
            }

            return Ok(teams);
      }

      [HttpPost]
      [Authorize]
      public IActionResult PostTeam([FromBody] TeamPostDto newTeamDto)
      {
            if (!ModelState.IsValid)
            {
                  return BadRequest(ModelState);
            }

            if (string.IsNullOrEmpty(newTeamDto.TeamName))
            {
                  return BadRequest(new { message = "TeamName is required." });
            }

            var team = _teamsService.CreateTeam(newTeamDto);

            return CreatedAtAction(
                nameof(GetTeams),
                new { id = team.TeamId },
                team
            );
      }

      [HttpPatch("{teamId}")]
      [Authorize]
      public IActionResult UpdateTeam(int teamId, [FromBody] TeamPostDto teamDto)
      {
            if (!ModelState.IsValid)
            {
                  return BadRequest(ModelState);
            }

            var team = _teamsService.UpdateTeam(teamId, teamDto);
            if (team == null)
            {
                  return NotFound("Không tìm thấy đội để cập nhật.");
            }

            return Ok(team);
      }

      [HttpGet("{teamId}/bowlers")]
      [AllowAnonymous]
      public IActionResult GetBowlerByTeamId(int teamId)
      {
            if (!ModelState.IsValid)
            {
                  return BadRequest(ModelState);
            }

            var data = _teamsService.GetBowlersByTeamId(teamId).ToList();
            if (data.Count == 0)
            {
                  return Ok(new List<Bowler>());
            }

            return Ok(data);
      }
}
