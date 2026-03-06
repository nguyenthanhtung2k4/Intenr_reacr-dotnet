using Backend.Models.Entities;
namespace Backend.Data.Repositories
{
      public interface IBowlingLeagueRepository
      {
            IEnumerable<Bowler> Bowlers { get; }
            IEnumerable<Accounts> Accounts { get; }

            IEnumerable<BowlerScore> Scores { get; }

            IEnumerable<MatchGame> MatchGames { get; }

            IEnumerable<Team> Teams { get; }
            // IEnumerable<idTeamDto> GetIdTeam { get; }

            IEnumerable<Tournament> Tournaments { get; }

            IEnumerable<TourneyMatch> TourneyMatches { get; }

            IEnumerable<ZtblBowlerRating> ZtblBowlerRatings { get; }

            IEnumerable<ZtblSkipLabel> ZtblSkipLabels { get; }

            IEnumerable<ZtblWeek> ZtblWeek { get; }

            void UpdateBowler(Bowler bowler);

            void Update<T>(T entity);

            void UpdateAccounts(Accounts accounts);
            void CreateAcounts(Accounts accounts);
            void CreateBowler(Bowler bowler);
            void CreateTeam(Team team);
            void CreateTournament(Tournament tournament);
            void CreateMatch(TourneyMatch match);
            void DeleteMatch(int matchId);
            void CreateBowlerScore(BowlerScore bowlerScore);
            void CreateOrUpdateMatchGame(int matchId, short gameNumber, int? winningTeamId, string? createdBy = null);
      }
}

