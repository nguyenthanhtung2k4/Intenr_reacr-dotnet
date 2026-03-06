namespace Backend.Models.Dtos;

public class MatchCreateDto
{
      public int TourneyId { get; set; }
      public string? Lanes { get; set; }
      public int OddLaneTeamId { get; set; }
      public int EvenLaneTeamId { get; set; }
      public bool IsDelete { get; set; }
      
}

