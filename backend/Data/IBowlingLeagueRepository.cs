namespace Backend.Data {
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
        void UpdateAccounts(Accounts accounts);
        void CreateAcounts(Accounts accounts);
        void CreateBowler(Bowler bowler);
        void CreateTeam(Team team);
    }
}
