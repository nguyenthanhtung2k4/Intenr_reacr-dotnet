using Backend.Models.Dtos;
using Backend.Models.Entities;

namespace Backend.Services.Interfaces;

public interface ITeamsService
{
      IEnumerable<Team> GetTeams();
      Team CreateTeam(TeamPostDto newTeamDto);
      Team? UpdateTeam(int teamId, TeamPostDto teamDto);
      IEnumerable<Bowler> GetBowlersByTeamId(int teamId);
}
