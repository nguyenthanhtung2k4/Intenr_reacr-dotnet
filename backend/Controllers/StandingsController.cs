using Backend.Models.Dtos;
using Backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class StandingsController(IStandingsService standingsService) : ControllerBase
{
      private readonly IStandingsService _standingsService = standingsService;

      [HttpGet]
      [AllowAnonymous]
      public IActionResult GetStandings()
      {
            var standings = _standingsService.GetStandings();
            return Ok(standings);
      }

      [HttpPut("{teamId}")]
      [Authorize(Roles = "Admin")]
      public IActionResult UpdateStanding(int teamId, [FromBody] UpdateStandingDto dto)
      {
            var team = _standingsService.UpdateStanding(teamId, dto);
            if (team == null)
            {
                  return NotFound(new { message = "Không tìm thấy đội" });
            }

            return Ok(new { message = "Cập nhật điểm thành công", team });
      }
}
