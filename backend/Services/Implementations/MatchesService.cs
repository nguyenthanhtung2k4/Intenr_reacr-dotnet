using Backend.Data.Repositories;
using Backend.Models.Dtos;
using Backend.Models.Entities;
using Backend.Services.Interfaces;

namespace Backend.Services.Implementations;

public class MatchesService(IBowlingLeagueRepository bowlingLeagueRepository) : IMatchesService
{
      private readonly IBowlingLeagueRepository _bowlingLeagueRepository = bowlingLeagueRepository;

      public TourneyMatch CreateMatch(MatchCreateDto matchDto, string? currentUserEmail)
      {
            var match = new TourneyMatch
            {
                  TourneyId = matchDto.TourneyId,
                  Lanes = matchDto.Lanes,
                  OddLaneTeamId = matchDto.OddLaneTeamId,
                  EvenLaneTeamId = matchDto.EvenLaneTeamId,
                  CreatedAt = DateTime.Now,
                  CreatedBy = currentUserEmail
            };

            _bowlingLeagueRepository.CreateMatch(match);
            return match;
      }

      public TourneyMatch? UpdateMatch(int id, MatchCreateDto matchDto, string? currentUserEmail)
      {
            var match = _bowlingLeagueRepository.TourneyMatches.FirstOrDefault(m => m.MatchId == id);
            if (match == null)
            {
                  return null;
            }

            match.TourneyId = matchDto.TourneyId;
            match.Lanes = matchDto.Lanes;
            match.OddLaneTeamId = matchDto.OddLaneTeamId;
            match.EvenLaneTeamId = matchDto.EvenLaneTeamId;
            match.UpdatedAt = DateTime.Now;
            match.UpdatedBy = currentUserEmail;

            if (matchDto.IsDelete)
            {
                  match.IsDelete = true;
                  match.DeletedAt = DateTime.Now;
                  match.DeletedBy = currentUserEmail;
            }
            else
            {
                  match.IsDelete = false;
                  match.DeletedAt = null;
                  match.DeletedBy = null;
            }

            _bowlingLeagueRepository.Update(match);
            return match;
      }

      public IEnumerable<MatchListDto> GetMatches()
      {
            var matchGames = _bowlingLeagueRepository.MatchGames.ToList();
            var scores = _bowlingLeagueRepository.Scores.ToList();
            var bowlers = _bowlingLeagueRepository.Bowlers.Where(b => b.IsDelete != true).ToList();

            var matches = _bowlingLeagueRepository.TourneyMatches.Select(m =>
            {
                  var games = matchGames.Where(mg => mg.MatchId == m.MatchId).ToList();

                  var oddLaneWins = 0;
                  var evenLaneWins = 0;

                  var matchScores = scores.Where(s => s.MatchId == m.MatchId).ToList();
                  var gameNumbers = games.Select(g => g.GameNumber).Union(matchScores.Select(s => s.GameNumber)).Distinct();

                  foreach (var gameNum in gameNumbers)
                  {
                        var gameScores = matchScores.Where(s => s.GameNumber == gameNum).ToList();

                        if (gameScores.Count > 0)
                        {
                              var oddScore = gameScores
                                    .Where(s => bowlers.Any(b => b.BowlerId == s.BowlerId && b.TeamId == m.OddLaneTeamId))
                                    .Sum(s => (long)((s.RawScore ?? 0) + (s.HandiCapScore ?? 0)));

                              var evenScore = gameScores
                                    .Where(s => bowlers.Any(b => b.BowlerId == s.BowlerId && b.TeamId == m.EvenLaneTeamId))
                                    .Sum(s => (long)((s.RawScore ?? 0) + (s.HandiCapScore ?? 0)));

                              if (oddScore > evenScore) oddLaneWins++;
                              else if (evenScore > oddScore) evenLaneWins++;
                        }
                        else
                        {
                              var mg = games.FirstOrDefault(g => g.GameNumber == gameNum);
                              if (mg != null)
                              {
                                    if (mg.WinningTeamId == m.OddLaneTeamId) oddLaneWins++;
                                    else if (mg.WinningTeamId == m.EvenLaneTeamId) evenLaneWins++;
                              }
                        }
                  }

                  int? winningTeamId = null;
                  string? winningTeamName = null;

                  if (oddLaneWins > evenLaneWins)
                  {
                        winningTeamId = m.OddLaneTeamId;
                        winningTeamName = m.OddLaneTeam?.TeamName;
                  }
                  else if (evenLaneWins > oddLaneWins)
                  {
                        winningTeamId = m.EvenLaneTeamId;
                        winningTeamName = m.EvenLaneTeam?.TeamName;
                  }

                  return new MatchListDto
                  {
                        MatchId = m.MatchId,
                        TourneyLocation = m.Tourney?.TourneyLocation,
                        TourneyDate = m.Tourney?.TourneyDate,
                        OddLaneTeam = m.OddLaneTeam?.TeamName,
                        EvenLaneTeam = m.EvenLaneTeam?.TeamName,
                        Lanes = m.Lanes,
                        TourneyId = m.TourneyId,
                        OddLaneTeamId = m.OddLaneTeamId,
                        EvenLaneTeamId = m.EvenLaneTeamId,
                        HasResult = games.Count > 0 || matchScores.Count > 0,
                        WinningTeamId = winningTeamId,
                        WinningTeamName = winningTeamName,
                        OddLaneWins = oddLaneWins,
                        EvenLaneWins = evenLaneWins
                  };
            }).ToList();

            return matches;
      }

      public MatchScoreDetailDto? GetMatchScores(int matchId)
      {
            var match = _bowlingLeagueRepository.TourneyMatches
                  .FirstOrDefault(m => m.MatchId == matchId);

            if (match == null)
            {
                  return null;
            }

            var scores = _bowlingLeagueRepository.Scores
                  .Where(s => s.MatchId == matchId)
                  .ToList();
            var bowlers = _bowlingLeagueRepository.Bowlers.ToList();
            var teams = _bowlingLeagueRepository.Teams.ToList();

            var oddTeamBowlerIds = bowlers
                  .Where(b => b.TeamId == match.OddLaneTeamId)
                  .Select(b => b.BowlerId)
                  .ToList();
            var evenTeamBowlerIds = bowlers
                  .Where(b => b.TeamId == match.EvenLaneTeamId)
                  .Select(b => b.BowlerId)
                  .ToList();

            var gameNumbers = scores.Select(s => s.GameNumber).Distinct().OrderBy(g => g);
            var games = gameNumbers.Select(gameNum =>
            {
                  var gameScores = scores.Where(s => s.GameNumber == gameNum).ToList();

                  var oddTeamTotal = gameScores
                        .Where(s => oddTeamBowlerIds.Contains(s.BowlerId))
                        .Sum(s => (s.RawScore ?? 0) + (s.HandiCapScore ?? 0));
                  var evenTeamTotal = gameScores
                        .Where(s => evenTeamBowlerIds.Contains(s.BowlerId))
                        .Sum(s => (s.RawScore ?? 0) + (s.HandiCapScore ?? 0));

                  int? winningTeamId = null;
                  if (oddTeamTotal > evenTeamTotal) winningTeamId = match.OddLaneTeamId;
                  else if (evenTeamTotal > oddTeamTotal) winningTeamId = match.EvenLaneTeamId;

                  var bowlerScoreDtos = gameScores.Select(s =>
                  {
                        var bowler = bowlers.FirstOrDefault(b => b.BowlerId == s.BowlerId);
                        return new BowlerGameScoreDto
                        {
                              BowlerId = s.BowlerId,
                              BowlerName = bowler != null ? $"{bowler.BowlerFirstName} {bowler.BowlerLastName}" : "Unknown",
                              TeamId = bowler?.TeamId,
                              RawScore = s.RawScore ?? 0,
                              HandicapScore = s.HandiCapScore,
                              WonGame = s.WonGame
                        };
                  }).ToList();

                  return new GameScoreDto
                  {
                        GameNumber = gameNum,
                        OddTeamTotalScore = oddTeamTotal,
                        EvenTeamTotalScore = evenTeamTotal,
                        WinningTeamId = winningTeamId,
                        BowlerScores = bowlerScoreDtos
                  };
            }).ToList();

            var oddTeam = teams.FirstOrDefault(t => t.TeamId == match.OddLaneTeamId);
            var evenTeam = teams.FirstOrDefault(t => t.TeamId == match.EvenLaneTeamId);

            return new MatchScoreDetailDto
            {
                  MatchId = matchId,
                  OddLaneTeam = oddTeam?.TeamName,
                  EvenLaneTeam = evenTeam?.TeamName,
                  OddLaneTeamId = match.OddLaneTeamId,
                  EvenLaneTeamId = match.EvenLaneTeamId,
                  Games = games
            };
      }

      public MatchScoreSubmitResult? SubmitMatchScores(MatchScoreInputDto dto, string? currentUserEmail)
      {
            var match = _bowlingLeagueRepository.TourneyMatches
                  .FirstOrDefault(m => m.MatchId == dto.MatchId);

            if (match == null)
            {
                  return null;
            }

            var bowlers = _bowlingLeagueRepository.Bowlers.ToList();

            var oddTeamBowlerIds = bowlers
                  .Where(b => b.TeamId == match.OddLaneTeamId)
                  .Select(b => b.BowlerId)
                  .ToList();
            var evenTeamBowlerIds = bowlers
                  .Where(b => b.TeamId == match.EvenLaneTeamId)
                  .Select(b => b.BowlerId)
                  .ToList();

            var oddTeamTotal = dto.Scores
                  .Where(s => oddTeamBowlerIds.Contains(s.BowlerId))
                  .Sum(s => s.RawScore + (s.HandicapScore ?? 0));
            var evenTeamTotal = dto.Scores
                  .Where(s => evenTeamBowlerIds.Contains(s.BowlerId))
                  .Sum(s => s.RawScore + (s.HandicapScore ?? 0));

            int? winningTeamId = null;
            if (oddTeamTotal > evenTeamTotal) winningTeamId = match.OddLaneTeamId;
            else if (evenTeamTotal > oddTeamTotal) winningTeamId = match.EvenLaneTeamId;

            foreach (var scoreEntry in dto.Scores)
            {
                  var bowler = bowlers.FirstOrDefault(b => b.BowlerId == scoreEntry.BowlerId);
                  if (bowler == null) continue;

                  var wonGame = bowler.TeamId == winningTeamId;

                  var bowlerScore = new BowlerScore
                  {
                        MatchId = dto.MatchId,
                        GameNumber = dto.GameNumber,
                        BowlerId = scoreEntry.BowlerId,
                        RawScore = scoreEntry.RawScore,
                        HandiCapScore = scoreEntry.HandicapScore,
                        WonGame = wonGame,
                        CreatedAt = DateTime.Now,
                        CreatedBy = currentUserEmail
                  };

                  _bowlingLeagueRepository.CreateBowlerScore(bowlerScore);
            }

            _bowlingLeagueRepository.CreateOrUpdateMatchGame(dto.MatchId, dto.GameNumber, winningTeamId, currentUserEmail);

            return new MatchScoreSubmitResult(
                  "Nhập điểm thành công!",
                  dto.MatchId,
                  dto.GameNumber,
                  oddTeamTotal,
                  evenTeamTotal,
                  winningTeamId);
      }
}
