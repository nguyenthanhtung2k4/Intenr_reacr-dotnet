namespace Backend.Models.Dtos;

public class MatchScoreDetailDto
{
      public int MatchId { get; set; }
      public string? OddLaneTeam { get; set; }
      public string? EvenLaneTeam { get; set; }
      public int? OddLaneTeamId { get; set; }
      public int? EvenLaneTeamId { get; set; }
      public List<GameScoreDto> Games { get; set; } = new();
}

public class GameScoreDto
{
      public short GameNumber { get; set; }
      public int OddTeamTotalScore { get; set; }
      public int EvenTeamTotalScore { get; set; }
      public int? WinningTeamId { get; set; }
      public List<BowlerGameScoreDto> BowlerScores { get; set; } = new();
}

public class BowlerGameScoreDto
{
      public int BowlerId { get; set; }
      public string BowlerName { get; set; } = string.Empty;
      public int? TeamId { get; set; }
      public short RawScore { get; set; }
      public short? HandicapScore { get; set; }
      public bool WonGame { get; set; }
}

