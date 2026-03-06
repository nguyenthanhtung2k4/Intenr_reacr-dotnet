namespace Backend.Models.Dtos;

public class MatchScoreInputDto
{
      public int MatchId { get; set; }
      public short GameNumber { get; set; }
      public List<BowlerScoreEntry> Scores { get; set; } = new();
}

public class BowlerScoreEntry
{
      public int BowlerId { get; set; }
      public short RawScore { get; set; }
      public short? HandicapScore { get; set; }
}

