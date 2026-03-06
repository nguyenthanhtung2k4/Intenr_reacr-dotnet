using Backend.Models.Dtos;
using Backend.Models.Entities;

namespace Backend.Services.Interfaces;

public interface IStandingsService
{
      IEnumerable<StandingDto> GetStandings();
      Team? UpdateStanding(int teamId, UpdateStandingDto dto);
}
