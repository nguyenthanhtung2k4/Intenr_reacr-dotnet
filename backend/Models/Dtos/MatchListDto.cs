namespace Backend.Models.Dtos;

public class MatchListDto
{
      public int MatchId { get; set; }
      public string? TourneyLocation { get; set; }
      public DateOnly? TourneyDate { get; set; }
      public string? OddLaneTeam { get; set; }
      public string? EvenLaneTeam { get; set; }
      public string? Lanes { get; set; }
      public int? TourneyId { get; set; }
      public int? OddLaneTeamId { get; set; }
      public int? EvenLaneTeamId { get; set; }
      
      // Match result info
      public bool HasResult { get; set; }
      public int? WinningTeamId { get; set; }
      public string? WinningTeamName { get; set; }
      public int OddLaneWins { get; set; }
      public int EvenLaneWins { get; set; }
}

