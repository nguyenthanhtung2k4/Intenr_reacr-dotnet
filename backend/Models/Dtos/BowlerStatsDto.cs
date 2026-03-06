namespace Backend.Models.Dtos;

public class BowlerStatsDto
{
      public int BowlerId { get; set; }
      public string BowlerName { get; set; } = string.Empty;
      public int? TeamId { get; set; }
      public string? TeamName { get; set; }
      public int TotalGames { get; set; }
      public double AverageScore { get; set; }
      public int HighScore { get; set; }
      public int TotalPins { get; set; }
      public int GamesWon { get; set; }
}

