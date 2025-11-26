using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Backend.Data
{
    public class EFBowlingLeagueRepository : IBowlingLeagueRepository
    {
        private readonly BowlingLeagueContext _bowlingContext;

        public EFBowlingLeagueRepository(BowlingLeagueContext temp)
        {
            _bowlingContext = temp;
        }

        public IEnumerable<Bowler> Bowlers => _bowlingContext.Bowlers.Include(x => x.Team).ToList();
        public IEnumerable<Accounts> Accounts => _bowlingContext.Accounts;

        public IEnumerable<BowlerScore> Scores => _bowlingContext.Scores;

        public IEnumerable<MatchGame> MatchGames => _bowlingContext.MatchGames;

        public IEnumerable<Team> Teams => _bowlingContext.Teams;

        public IEnumerable<Tournament> Tournaments => _bowlingContext.Tournaments;

        public IEnumerable<TourneyMatch> TourneyMatches => _bowlingContext.TourneyMatches;

        public IEnumerable<ZtblBowlerRating> ZtblBowlerRatings => _bowlingContext.ZtblBowlerRatings;

        public IEnumerable<ZtblSkipLabel> ZtblSkipLabels => _bowlingContext.ZtblSkipLabels;

        public IEnumerable<ZtblWeek> ZtblWeek => _bowlingContext.ZtblWeeks;

        // 🔹 Update
        public void UpdateBowler(Bowler bowler)
        {
            try
            {
                _bowlingContext.Bowlers.Update(bowler);
                _bowlingContext.SaveChanges();
            }
            catch (DbUpdateException dbEx)
            {
                throw new Exception($"Lỗi cập nhật Bowler: {dbEx.InnerException?.Message ?? dbEx.Message}");
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
                throw new Exception($"Lỗi cập nhật Bowler: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
        }

        public void CreateAcounts(Accounts accounts)
        {
            try
            {
                
                _bowlingContext.Accounts.Add(accounts);
                _bowlingContext.SaveChanges();
            }
            catch (DbUpdateException dbEx)
            {
                throw new Exception($"Lỗi lưu Accounts: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }


        }

        // 🔹 Create
        public void CreateBowler(Bowler bowler)
        {
            try
            {
                // ⚠️ Bỏ ID cũ để EF tự tăng
                bowler.BowlerId = 0;

                if (bowler.TeamId.HasValue)
                {
                    var existingTeam = _bowlingContext.Teams
                        .FirstOrDefault(t => t.TeamId == bowler.TeamId.Value);

                    if (existingTeam == null)
                    {
                        throw new Exception($"Không tìm thấy Team với ID {bowler.TeamId}");
                    }

                    bowler.Team = existingTeam;
                }

                _bowlingContext.Bowlers.Add(bowler);
                _bowlingContext.SaveChanges();
            }
            catch (DbUpdateException dbEx)
            {
                throw new Exception($"Lỗi lưu Bowler: {dbEx.InnerException?.Message ?? dbEx.Message}");
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
                throw new Exception($"Lỗi lưu Bowler: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
        }

    }
}
