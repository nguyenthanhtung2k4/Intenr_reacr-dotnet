namespace Backend.Models.Dtos;

public class StandingDto
{
      public int TeamId { get; set; }
      public string TeamName { get; set; } = string.Empty;
      public int Played { get; set; }
      public int Won { get; set; }
      public int Lost { get; set; }
      public int Points { get; set; }
      public int TotalPins { get; set; }
      public double Average { get; set; }
}

