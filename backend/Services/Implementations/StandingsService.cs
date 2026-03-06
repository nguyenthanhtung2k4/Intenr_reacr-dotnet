using Backend.Data.Repositories;
using Backend.Models.Dtos;
using Backend.Models.Entities;
using Backend.Services.Interfaces;

namespace Backend.Services.Implementations;

public class StandingsService(IBowlingLeagueRepository bowlingLeagueRepository) : IStandingsService
{
      private readonly IBowlingLeagueRepository _bowlingLeagueRepository = bowlingLeagueRepository;

      public IEnumerable<StandingDto> GetStandings()
      {
            var teams = _bowlingLeagueRepository.Teams.Where(t => !t.IsDelete).ToList();
            var standings = new List<StandingDto>();

            var matchGames = _bowlingLeagueRepository.MatchGames.ToList();
            var tourneyMatches = _bowlingLeagueRepository.TourneyMatches.ToList();
            var scores = _bowlingLeagueRepository.Scores.ToList();
            var bowlers = _bowlingLeagueRepository.Bowlers.ToList();

            foreach (var team in teams)
            {
                  var teamMatchIds = tourneyMatches
                        .Where(m => m.OddLaneTeamId == team.TeamId || m.EvenLaneTeamId == team.TeamId)
                        .Select(m => m.MatchId)
                        .ToList();

                  var teamGames = matchGames.Where(mg => teamMatchIds.Contains(mg.MatchId)).ToList();

                  var gamesPlayed = teamGames.Count;
                  var gamesWon = teamGames.Count(mg => mg.WinningTeamId == team.TeamId);
                  var gamesLost = gamesPlayed - gamesWon;
                  var points = gamesWon * 2;

                  var teamBowlerIds = bowlers.Where(b => b.TeamId == team.TeamId).Select(b => b.BowlerId).ToList();
                  var teamScores = scores.Where(s => teamBowlerIds.Contains(s.BowlerId)).ToList();

                  var totalPins = teamScores.Sum(s => (long)(s.RawScore ?? 0));
                  var averagePerGame = gamesPlayed > 0 ? (double)totalPins / gamesPlayed : 0;

                  standings.Add(new StandingDto
                  {
                        TeamId = team.TeamId,
                        TeamName = team.TeamName ?? "Unknown",
                        Played = gamesPlayed,
                        Won = gamesWon,
                        Lost = gamesLost,
                        Points = points,
                        TotalPins = (int)totalPins,
                        Average = Math.Round(averagePerGame, 1)
                  });
            }

            return standings.OrderByDescending(s => s.Points).ThenByDescending(s => s.TotalPins).ToList();
      }

      public Team? UpdateStanding(int teamId, UpdateStandingDto dto)
      {
            var team = _bowlingLeagueRepository.Teams.FirstOrDefault(t => t.TeamId == teamId);
            if (team == null || team.IsDelete)
            {
                  return null;
            }

            team.ManualWins = dto.ManualWins;
            team.ManualLosses = dto.ManualLosses;
            team.ManualPoints = dto.ManualPoints;

            _bowlingLeagueRepository.Update(team);
            return team;
      }
}
