using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using Backend.Data.Contexts;
using Backend.Models.Entities;

namespace Backend.Data.Repositories
{
      public class EFBowlingLeagueRepository(BowlingLeagueContext temp) : IBowlingLeagueRepository
      {
            private readonly BowlingLeagueContext _bowlingContext = temp;

            public IEnumerable<Bowler> Bowlers => [.. _bowlingContext.Bowlers.Include(x => x.Team).ToList()];
            public IEnumerable<Accounts> Accounts => [.. _bowlingContext.Accounts];

            public IEnumerable<BowlerScore> Scores => [.. _bowlingContext.Scores];

            public IEnumerable<MatchGame> MatchGames => [.. _bowlingContext.MatchGames.Include(x => x.Match).ToList()];

            public IEnumerable<Team> Teams => [.. _bowlingContext.Teams];

            public IEnumerable<Tournament> Tournaments => [.. _bowlingContext.Tournaments];

            public IEnumerable<TourneyMatch> TourneyMatches =>
            [.._bowlingContext.TourneyMatches
                .Include(x => x.Tourney)
                .Include(x => x.OddLaneTeam)
                .Include(x => x.EvenLaneTeam)
                .ToList()];

            public IEnumerable<ZtblBowlerRating> ZtblBowlerRatings => _bowlingContext.ZtblBowlerRatings;

            public IEnumerable<ZtblSkipLabel> ZtblSkipLabels => _bowlingContext.ZtblSkipLabels;

            public IEnumerable<ZtblWeek> ZtblWeek => _bowlingContext.ZtblWeeks;

            // ?? Update
            public void UpdateBowler(Bowler bowler)
            {
                  try
                  {
                        _bowlingContext.Bowlers.Update(bowler);
                        _bowlingContext.SaveChanges();
                  }
                  catch (DbUpdateException dbEx)
                  {
                        throw new Exception($"L?i c?p nh?t Bowler: {dbEx.InnerException?.Message ?? dbEx.Message}");
                  }
            }
            public void UpdateAccounts(Accounts accounts)
            {
                  try
                  {
                        _bowlingContext.Accounts.Update(accounts);
                        _bowlingContext.SaveChanges();
                  }
                  catch (DbUpdateException dbEx)
                  {
                        throw new Exception($"L?i c?p nh?t Bowler: {dbEx.InnerException?.Message ?? dbEx.Message}");
                  }
            }

            public void Update<T>(T entity)
            {
                  if (entity == null)
                  {
                        throw new ArgumentNullException(nameof(entity));
                  }

                  try
                  {
                        _bowlingContext.Update(entity);
                        _bowlingContext.SaveChanges();
                  }
                  catch (DbUpdateException dbEx)
                  {
                        throw new Exception($"L?i c?p nh?t Bowler: {dbEx.InnerException?.Message ?? dbEx.Message}");
                  }
            }

            // ?? Create
            public void CreateAcounts(Accounts accounts)
            {
                  try
                  {

                        _bowlingContext.Accounts.Add(accounts);
                        _bowlingContext.SaveChanges();
                  }
                  catch (DbUpdateException dbEx)
                  {
                        throw new Exception($"L?i luu Accounts: {dbEx.InnerException?.Message ?? dbEx.Message}");
                  }


            }

            // ?? Create
            public void CreateBowler(Bowler bowler)
            {
                  ArgumentNullException.ThrowIfNull(bowler);

                  try
                  {
                        bowler.BowlerId = 0;

                        if (bowler.TeamId.HasValue)
                        {
                              var existingTeam = _bowlingContext.Teams
                              .FirstOrDefault(t => t.TeamId == bowler.TeamId.Value)
                              ?? throw new Exception($"Không tìm th?y Team v?i ID {bowler.TeamId}");

                              bowler.Team = existingTeam;
                        }

                        _bowlingContext.Bowlers.Add(bowler);
                        _bowlingContext.SaveChanges();
                  }
                  catch (DbUpdateException dbEx)
                  {
                        throw new Exception($"L?i luu Bowler: {dbEx.InnerException?.Message ?? dbEx.Message}");
                  }
            }

            public void CreateTeam(Team team)
            {
                  try
                  {

                        _bowlingContext.Teams.Add(team);
                        _bowlingContext.SaveChanges();
                  }
                  catch (DbUpdateException dbEx)
                  {
                        throw new Exception($"L?i luu Bowler: {dbEx.InnerException?.Message ?? dbEx.Message}");
                  }
            }

            public void CreateTournament(Tournament tournament)
            {
                  try
                  {
                        _bowlingContext.Tournaments.Add(tournament);
                        _bowlingContext.SaveChanges();
                  }
                  catch (DbUpdateException dbEx)
                  {
                        throw new Exception($"L?i luu Tournament: {dbEx.InnerException?.Message ?? dbEx.Message}");
                  }
            }

            public void CreateMatch(TourneyMatch match)
            {
                  try
                  {
                        _bowlingContext.TourneyMatches.Add(match);
                        _bowlingContext.SaveChanges();
                  }
                  catch (DbUpdateException dbEx)
                  {
                        throw new Exception($"L?i luu Match: {dbEx.InnerException?.Message ?? dbEx.Message}");
                  }
            }



            public void DeleteMatch(int matchId)
            {
                  try
                  {
                        var match = _bowlingContext.TourneyMatches.FirstOrDefault(m => m.MatchId == matchId);
                        if (match != null)
                        {
                              _bowlingContext.TourneyMatches.Remove(match);
                              _bowlingContext.SaveChanges();
                        }
                        else
                        {
                              throw new Exception($"Match with ID {matchId} not found");
                        }
                  }
                  catch (DbUpdateException dbEx)
                  {
                        throw new Exception($"L?i xóa Match: {dbEx.InnerException?.Message ?? dbEx.Message}");
                  }
            }

            public void CreateBowlerScore(BowlerScore bowlerScore)
            {
                  try
                  {
                        // Check if score already exists for this bowler/match/game combination
                        var existing = _bowlingContext.Scores
                              .FirstOrDefault(s => s.MatchId == bowlerScore.MatchId
                                    && s.GameNumber == bowlerScore.GameNumber
                                    && s.BowlerId == bowlerScore.BowlerId);

                        if (existing != null)
                        {
                              // Update existing score
                              existing.RawScore = bowlerScore.RawScore;
                              existing.HandiCapScore = bowlerScore.HandiCapScore;
                              existing.WonGame = bowlerScore.WonGame;
                              existing.UpdatedAt = DateTime.Now;
                              existing.UpdatedBy = bowlerScore.CreatedBy;
                        }
                        else
                        {
                              // Add new score
                              _bowlingContext.Scores.Add(bowlerScore);
                        }
                        _bowlingContext.SaveChanges();
                  }
                  catch (DbUpdateException dbEx)
                  {
                        throw new Exception($"L?i luu BowlerScore: {dbEx.InnerException?.Message ?? dbEx.Message}");
                  }
            }

            public void CreateOrUpdateMatchGame(int matchId, short gameNumber, int? winningTeamId, string? createdBy = null)
            {
                  try
                  {
                        var existing = _bowlingContext.MatchGames
                              .FirstOrDefault(mg => mg.MatchId == matchId && mg.GameNumber == gameNumber);

                        if (existing != null)
                        {
                              existing.WinningTeamId = winningTeamId;
                              existing.UpdatedAt = DateTime.Now;
                              existing.UpdatedBy = createdBy;
                        }
                        else
                        {
                              var matchGame = new MatchGame
                              {
                                    MatchId = matchId,
                                    GameNumber = gameNumber,
                                    WinningTeamId = winningTeamId,
                                    CreatedAt = DateTime.Now,
                                    CreatedBy = createdBy
                              };
                              _bowlingContext.MatchGames.Add(matchGame);
                        }
                        _bowlingContext.SaveChanges();
                  }
                  catch (DbUpdateException dbEx)
                  {
                        throw new Exception($"L?i luu MatchGame: {dbEx.InnerException?.Message ?? dbEx.Message}");
                  }
            }

      }
}

