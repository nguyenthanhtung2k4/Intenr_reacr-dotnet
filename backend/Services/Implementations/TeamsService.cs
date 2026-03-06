using Backend.Data.Repositories;
using Backend.Models.Dtos;
using Backend.Models.Entities;
using Backend.Services.Interfaces;

namespace Backend.Services.Implementations;

public class TeamsService(IBowlingLeagueRepository bowlingLeagueRepository) : ITeamsService
{
      private readonly IBowlingLeagueRepository _bowlingLeagueRepository = bowlingLeagueRepository;

      public IEnumerable<Team> GetTeams()
      {
            return _bowlingLeagueRepository.Teams
                .OrderByDescending(t => t.TeamId)
                .Where(t => t.IsDelete == false)
                .ToList();
      }

      public Team CreateTeam(TeamPostDto newTeamDto)
      {
            var team = new Team
            {
                  TeamName = newTeamDto.TeamName,
                  CaptainId = newTeamDto.CaptainId,
                  IsDelete = false
            };

            _bowlingLeagueRepository.CreateTeam(team);
            return team;
      }

      public Team? UpdateTeam(int teamId, TeamPostDto teamDto)
      {
            var team = _bowlingLeagueRepository.Teams.FirstOrDefault(t => t.TeamId == teamId);

            if (team == null)
            {
                  return null;
            }

            if (!string.IsNullOrEmpty(teamDto.TeamName))
            {
                  team.TeamName = teamDto.TeamName;
            }

            if (teamDto.CaptainId.HasValue)
            {
                  team.CaptainId = teamDto.CaptainId;
            }

            team.IsDelete = teamDto.IsDelete;

            _bowlingLeagueRepository.Update(team);
            return team;
      }

      public IEnumerable<Bowler> GetBowlersByTeamId(int teamId)
      {
            return _bowlingLeagueRepository.Bowlers
                  .Where(e => e.TeamId == teamId && e.IsDelete != true)
                  .ToList();
      }
}
